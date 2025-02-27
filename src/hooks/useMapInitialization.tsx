
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
  const tokenRetryCount = useRef(0);

  const initializeMap = useCallback(async (force = false) => {
    if (!mapContainer.current) {
      console.warn('Map container ref is not available');
      return;
    }
    
    if (initializedRef.current && !force) {
      console.log('Map already initialized and force=false, skipping initialization');
      return;
    }
    
    try {
      // Clean up existing map if forcing reinitialization
      if (force && map.current) {
        console.log('Force reinitialization - removing existing map instance');
        map.current.remove();
        map.current = null;
        initializedRef.current = false;
        setIsStyleLoaded(false);
      }

      console.log('Getting Mapbox token...');
      let token;
      try {
        token = await getMapboxToken();
        console.log('Mapbox token retrieved successfully');
        // Reset retry count on success
        tokenRetryCount.current = 0;
      } catch (error) {
        console.error('Failed to get Mapbox token:', error);
        
        // Retry logic for token retrieval
        if (tokenRetryCount.current < 3) {
          tokenRetryCount.current++;
          console.log(`Retrying token retrieval (attempt ${tokenRetryCount.current})...`);
          
          // Wait 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return initializeMap(force);
        }
        
        // If we've exceeded retry attempts, use a default public token as fallback
        // This is just to prevent the app from completely breaking
        console.warn('Using fallback Mapbox token after failed retries');
        token = 'pk.eyJ1IjoiYnJld2Vyc21hcCIsImEiOiJjbHJlNG54OWowM2h2Mmpxa2cxZTlrMWFrIn0.DoCEzsoXFHJB4m-f7NmKLQ';
      }
      
      mapboxgl.accessToken = token;
      
      console.log('Creating new map instance...');
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [133.7751, -25.2744], // Center of Australia
        zoom: 4
      });

      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current = newMap;
      initializedRef.current = true;

      // Create and store the style load listener
      const onStyleLoad = () => {
        console.log('Map style loaded event fired');
        
        // Ensure style is fully loaded before proceeding
        if (newMap.isStyleLoaded()) {
          console.log('Style is loaded, setting isStyleLoaded to true');
          setIsStyleLoaded(true);
        } else {
          console.log('Style not loaded yet after style.load event, setting up interval check');
          
          // If style isn't loaded yet, wait for it with an interval
          let attempts = 0;
          const maxAttempts = 50; // 5 seconds (100ms * 50)
          
          const checkStyle = setInterval(() => {
            attempts++;
            
            if (newMap.isStyleLoaded()) {
              console.log(`Style loaded via interval check (attempt ${attempts})`);
              clearInterval(checkStyle);
              setIsStyleLoaded(true);
            } else if (attempts >= maxAttempts) {
              console.warn('Style still not loaded after max attempts, forcing isStyleLoaded to true');
              clearInterval(checkStyle);
              setIsStyleLoaded(true);
            }
          }, 100);
        }
      };
      
      onStyleLoadRef.current = onStyleLoad;

      // Add the event listener
      console.log('Adding style.load event listener');
      newMap.on('style.load', onStyleLoad);

      // Also check if style is already loaded (can happen with cached styles)
      if (newMap.isStyleLoaded()) {
        console.log('Style already loaded, initializing immediately');
        onStyleLoad();
      }
      
      console.log('Map initialization completed');
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map. Please refresh the page.');
    }
  }, []);

  // Initial map setup
  useEffect(() => {
    console.log('Map initialization effect running');
    initializeMap();

    return () => {
      if (map.current && onStyleLoadRef.current) {
        try {
          console.log('Cleaning up map instance');
          map.current.off('style.load', onStyleLoadRef.current);
          map.current.remove();
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
      map.current = null;
      initializedRef.current = false;
      onStyleLoadRef.current = null;
      console.log('Map cleanup completed');
    };
  }, [initializeMap]);

  const reinitializeMap = useCallback(() => {
    console.log('Reinitializing map with force=true');
    initializeMap(true);
  }, [initializeMap]);

  return { mapContainer, map, isStyleLoaded, reinitializeMap };
};
