
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

  // Reset the initialization state when the component mounts
  useEffect(() => {
    // Force reset of initialization state on mount
    initializedRef.current = false;
    return () => {
      // This ensures the next mount will trigger a fresh initialization
      initializedRef.current = false;
    };
  }, []);

  const initializeMap = useCallback(async () => {
    // Don't initialize if container isn't available
    if (!mapContainer.current) return;
    
    // If map is already initialized but we detect we need to recreate it
    if (map.current) {
      console.log('Cleaning up existing map instance before reinitializing');
      try {
        if (onStyleLoadRef.current) {
          map.current.off('style.load', onStyleLoadRef.current);
        }
        map.current.remove();
      } catch (error) {
        console.error('Error cleaning up existing map:', error);
      }
      map.current = null;
      initializedRef.current = false;
    }
    
    // Exit if already marked as initialized (prevents double init)
    if (initializedRef.current) return;
    
    try {
      console.log('Initializing map...');
      const token = await getMapboxToken();
      mapboxgl.accessToken = token;
      
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [133.7751, -25.2744], // Center of Australia
        zoom: 4
      });

      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Create and store the style load listener
      const onStyleLoad = () => {
        console.log('Map style loaded');
        if (newMap.isStyleLoaded()) {
          setIsStyleLoaded(true);
        } else {
          // If style isn't loaded yet, wait for it
          const checkStyle = setInterval(() => {
            if (newMap.isStyleLoaded()) {
              clearInterval(checkStyle);
              setIsStyleLoaded(true);
            }
          }, 100);

          // Clean up interval after 5 seconds if style hasn't loaded
          setTimeout(() => clearInterval(checkStyle), 5000);
        }
      };
      
      onStyleLoadRef.current = onStyleLoad;

      // Add the event listener
      newMap.on('style.load', onStyleLoad);

      // Check if style is already loaded
      if (newMap.isStyleLoaded()) {
        onStyleLoad();
      }

      map.current = newMap;
      initializedRef.current = true;
      console.log('Map initialization complete');
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map');
      // Reset initialization state on error so we can retry
      initializedRef.current = false;
    }
  }, []);

  // Initial map setup
  useEffect(() => {
    console.log('Map component mounted, initializing map');
    initializeMap();

    return () => {
      console.log('Map component unmounting, cleaning up map');
      if (map.current && onStyleLoadRef.current) {
        try {
          map.current.off('style.load', onStyleLoadRef.current);
          map.current.remove();
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
      map.current = null;
      initializedRef.current = false;
      onStyleLoadRef.current = null;
      setIsStyleLoaded(false);
    };
  }, [initializeMap]);

  return { mapContainer, map, isStyleLoaded };
};
