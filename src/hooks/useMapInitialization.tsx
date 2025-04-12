
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
    if (!mapContainer.current || initializedRef.current) return;
    
    try {
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
        setIsStyleLoaded(true);
      };
      
      onStyleLoadRef.current = onStyleLoad;

      // Add the event listener - better error handling
      newMap.on('style.load', onStyleLoad);
      
      // Handle error events
      newMap.on('error', (e) => {
        console.error('Map error:', e.error);
        toast.error('Map error occurred');
      });

      // Check if style is already loaded
      if (newMap.isStyleLoaded()) {
        onStyleLoad();
      }

      map.current = newMap;
      initializedRef.current = true;
      
      // Safety check: If style hasn't loaded after 5 seconds, check again
      setTimeout(() => {
        if (!isStyleLoaded && newMap.isStyleLoaded()) {
          console.log('Style loaded but event not fired, manually setting isStyleLoaded');
          setIsStyleLoaded(true);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map');
    }
  }, [isStyleLoaded]);

  // Initial map setup
  useEffect(() => {
    initializeMap();

    return () => {
      if (map.current) {
        try {
          // Clean up event listeners
          if (onStyleLoadRef.current) {
            map.current.off('style.load', onStyleLoadRef.current);
          }
          map.current.remove();
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
      map.current = null;
      initializedRef.current = false;
      onStyleLoadRef.current = null;
    };
  }, [initializeMap]);

  return { mapContainer, map, isStyleLoaded };
};
