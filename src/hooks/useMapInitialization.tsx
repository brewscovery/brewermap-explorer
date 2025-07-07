
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { getMapboxToken } from '@/utils/mapUtils';
import { toast } from 'sonner';

export const useMapInitialization = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const initializedRef = useRef(false);
  const onStyleLoadRef = useRef<(() => void) | null>(null);

  const initializeMap = useCallback(async () => {
    // Don't reinitialize if we already have a map instance and container hasn't changed
    if (!mapContainer.current || initializedRef.current) return;
    
    try {
      const token = await getMapboxToken();
      mapboxgl.accessToken = token;
      
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11', // Lighter style loads faster
        center: [133.7751, -25.2744], // Center of Australia
        zoom: 4,
        preserveDrawingBuffer: true, // Make the map more resilient to container changes
        // Performance optimizations
        antialias: false, // Disable antialiasing for better performance
        fadeDuration: 0, // Disable fade animations for faster loading
        interactive: true,
        // Mobile-specific optimizations
        trackResize: true, // Enable resize tracking for mobile orientation changes
        cooperativeGestures: false, // Disable cooperative gestures that can interfere on mobile
        touchZoomRotate: true, // Enable touch zoom and rotate
        dragPan: true, // Enable drag panning
        doubleClickZoom: true, // Enable double click zoom
        scrollZoom: true // Enable scroll zoom
      });

      // Defer adding controls to after map loads to avoid blocking
      const addControls = () => {
        newMap.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      };

      // Create and store the style load listener
      const onStyleLoad = () => {
        console.log('Map style loaded');
        
        // Only set isStyleLoaded to true when the style is actually fully loaded
        // and the Map is in a usable state
        if (newMap.loaded() && newMap.isStyleLoaded() && newMap.getStyle()) {
          console.log('Map style confirmed to be loaded and ready');
          setIsStyleLoaded(true);
        } else {
          console.log('Style load event fired but style not fully ready yet, waiting for map to be ready');
          
          // Wait for the next render cycle to check again
          newMap.once('render', () => {
            if (newMap.loaded() && newMap.isStyleLoaded() && newMap.getStyle()) {
              console.log('Map style now confirmed ready after render');
              setIsStyleLoaded(true);
            }
          });
        }
      };
      
      onStyleLoadRef.current = onStyleLoad;

      // Add the event listener for style.load
      newMap.on('style.load', onStyleLoad);

      // Also listen for the load event which fires when the map has been fully loaded
      newMap.on('load', () => {
        console.log('Map fully loaded');
        if (newMap.isStyleLoaded() && newMap.getStyle()) {
          console.log('Style confirmed loaded on map load event');
          setIsStyleLoaded(true);
        }
        
        // Add controls after map is fully loaded (non-blocking)
        setTimeout(addControls, 0);
        
        // Re-enable resize tracking after load
        (newMap as any)._trackResize = true;
      });

      map.current = newMap;
      initializedRef.current = true;
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map');
    }
  }, []);

  // Initial map setup
  useEffect(() => {
    initializeMap();

    return () => {
      // Only clean up if we're actually unmounting, not just auth state changing
      if (map.current && onStyleLoadRef.current) {
        try {
          // First remove event listeners
          if (onStyleLoadRef.current) {
            map.current.off('style.load', onStyleLoadRef.current);
          }
          
          // Then remove the map instance
          if (map.current) {
            try {
              map.current.remove();
            } catch (error) {
              console.error('Error removing map:', error);
            }
          }
          
          console.log('Map fully removed on unmount');
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
      
      // Clear all refs
      map.current = null;
      initializedRef.current = false;
      onStyleLoadRef.current = null;
      setIsStyleLoaded(false);
    };
  }, [initializeMap]);

  return { mapContainer, map, isStyleLoaded };
};
