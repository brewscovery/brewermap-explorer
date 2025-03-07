
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
    console.log('initializeMap called, initialized:', initializedRef.current);
    if (!mapContainer.current) {
      console.log('No map container ref, skipping initialization');
      return;
    }
    
    // Always initialize the map when the function is called
    // This allows for reinitialization after navigation
    if (initializedRef.current) {
      console.log('Map was already initialized, cleaning up first');
      if (map.current) {
        try {
          if (onStyleLoadRef.current) {
            map.current.off('style.load', onStyleLoadRef.current);
          }
          map.current.remove();
          console.log('Previous map instance removed');
        } catch (error) {
          console.error('Error removing previous map:', error);
        }
      }
      initializedRef.current = false;
      map.current = null;
      onStyleLoadRef.current = null;
      setIsStyleLoaded(false);
    }
    
    try {
      console.log('Fetching Mapbox token');
      const token = await getMapboxToken();
      mapboxgl.accessToken = token;
      console.log('Mapbox token set, creating new map instance');
      
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [133.7751, -25.2744], // Center of Australia
        zoom: 4
      });

      console.log('Map instance created');
      
      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      console.log('Navigation controls added');

      // Create and store the style load listener
      const onStyleLoad = () => {
        console.log('Map style load event fired');
        if (newMap.isStyleLoaded()) {
          console.log('Style is loaded, setting state');
          setIsStyleLoaded(true);
        } else {
          console.log('Style not fully loaded yet, checking with interval');
          // If style isn't loaded yet, wait for it
          const checkStyle = setInterval(() => {
            if (newMap.isStyleLoaded()) {
              console.log('Style loaded (via interval check)');
              clearInterval(checkStyle);
              setIsStyleLoaded(true);
            }
          }, 100);

          // Clean up interval after 5 seconds if style hasn't loaded
          setTimeout(() => {
            clearInterval(checkStyle);
            if (!isStyleLoaded) {
              console.log('Style load timeout reached, forcing loaded state');
              setIsStyleLoaded(true);
            }
          }, 5000);
        }
      };
      
      onStyleLoadRef.current = onStyleLoad;
      console.log('Registering style.load event listener');
      
      // Add the event listener
      newMap.on('style.load', onStyleLoad);

      // Check if style is already loaded
      if (newMap.isStyleLoaded()) {
        console.log('Style was already loaded, calling handler directly');
        onStyleLoad();
      }

      map.current = newMap;
      initializedRef.current = true;
      console.log('Map initialization complete');
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map');
    }
  }, [isStyleLoaded]);

  // Initial map setup
  useEffect(() => {
    console.log('Map initialization effect running');
    initializeMap();

    // Complete cleanup when component unmounts
    return () => {
      console.log('Map component unmounting, cleaning up');
      if (map.current && onStyleLoadRef.current) {
        try {
          console.log('Removing style.load listener');
          map.current.off('style.load', onStyleLoadRef.current);
          console.log('Removing map instance');
          map.current.remove();
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
      console.log('Resetting map refs and state');
      map.current = null;
      initializedRef.current = false;
      onStyleLoadRef.current = null;
      setIsStyleLoaded(false);
    };
  }, [initializeMap]);

  return { mapContainer, map, isStyleLoaded };
};
