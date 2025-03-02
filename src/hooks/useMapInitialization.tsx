
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
  const initializationInProgressRef = useRef(false);
  const mapEventListenersRef = useRef<Array<{ type: string; listener: any }>>([]);
  
  const cleanupExistingMap = useCallback(() => {
    if (map.current) {
      console.log('Cleaning up existing map instance');
      try {
        // Remove all added event listeners
        if (mapEventListenersRef.current.length > 0) {
          mapEventListenersRef.current.forEach(({ type, listener }) => {
            map.current?.off(type, listener);
          });
          mapEventListenersRef.current = [];
        }
        
        // Specific cleanup for style.load listener
        if (onStyleLoadRef.current) {
          map.current.off('style.load', onStyleLoadRef.current);
          onStyleLoadRef.current = null;
        }
        
        // Remove the map
        map.current.remove();
        console.log('Map instance successfully removed');
      } catch (error) {
        console.error('Error removing existing map:', error);
      }
      
      map.current = null;
      initializedRef.current = false;
      setIsStyleLoaded(false);
    }
  }, []);

  const initializeMap = useCallback(async (force = false) => {
    if (!mapContainer.current) {
      console.warn('Map container ref is not available');
      return false;
    }
    
    // If already initializing, prevent concurrent initialization
    if (initializationInProgressRef.current) {
      console.log('Map initialization already in progress, skipping');
      return false;
    }
    
    // If already initialized and not forcing, skip
    if (initializedRef.current && !force) {
      console.log('Map already initialized and not forcing, skipping');
      return false;
    }
    
    try {
      // Set flag to prevent multiple simultaneous initializations
      initializationInProgressRef.current = true;
      
      // Clean up existing map if forcing reinitialization
      if (force || map.current) {
        cleanupExistingMap();
      }

      console.log('Getting Mapbox token...');
      let token;
      try {
        token = await getMapboxToken();
        console.log('Mapbox token retrieved successfully');
        tokenRetryCount.current = 0;
      } catch (error) {
        console.error('Failed to get Mapbox token:', error);
        
        // Retry logic for token retrieval
        if (tokenRetryCount.current < 3) {
          tokenRetryCount.current++;
          console.log(`Retrying token retrieval (attempt ${tokenRetryCount.current})...`);
          
          // Wait 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          initializationInProgressRef.current = false;
          return initializeMap(force);
        }
        
        // If we've exceeded retry attempts, use a default public token as fallback
        console.warn('Using fallback Mapbox token after failed retries');
        token = 'pk.eyJ1IjoiYnJld2Vyc21hcCIsImEiOiJjbHJlNG54OWowM2h2Mmpxa2cxZTlrMWFrIn0.DoCEzsoXFHJB4m-f7NmKLQ';
      }
      
      mapboxgl.accessToken = token;
      
      console.log('Creating new map instance...');
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [133.7751, -25.2744], // Center of Australia
        zoom: 4,
        maxBounds: [
          [80, -50], // Southwest coordinates
          [180, 0]   // Northeast coordinates
        ],
        preserveDrawingBuffer: true // Add this to ensure map renders correctly
      });

      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current = newMap;
      
      // Track all event listeners added to the map for proper cleanup
      const addMapListener = (type: string, listener: any) => {
        newMap.on(type, listener);
        mapEventListenersRef.current.push({ type, listener });
      };
      
      // Add error handler for the map
      addMapListener('error', (e: any) => {
        console.error('Map error:', e.error);
      });

      initializedRef.current = true;

      // Create and store the style load listener
      const onStyleLoad = () => {
        console.log('Map style loaded event fired');
        
        // Ensure style is fully loaded before proceeding
        if (newMap.isStyleLoaded()) {
          console.log('Style is loaded, setting isStyleLoaded to true');
          setIsStyleLoaded(true);
          initializationInProgressRef.current = false;
          return true;
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
              initializationInProgressRef.current = false;
              return true;
            } else if (attempts >= maxAttempts) {
              console.warn('Style still not loaded after max attempts, forcing isStyleLoaded to true');
              clearInterval(checkStyle);
              setIsStyleLoaded(true);
              initializationInProgressRef.current = false;
              // Force a style reload as a last resort
              try {
                newMap.setStyle('mapbox://styles/mapbox/light-v11');
              } catch (e) {
                console.error('Error forcing style reload:', e);
              }
              return true;
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
      return true;
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map. Please refresh the page.');
      initializationInProgressRef.current = false;
      return false;
    }
  }, [cleanupExistingMap]);

  // Initial map setup
  useEffect(() => {
    console.log('Map initialization effect running');
    // If user tried to initialize manually but it failed, we try again automatically
    const timer = setTimeout(() => {
      if (!initializedRef.current) {
        console.log('Initial map initialization not completed, trying again automatically');
        initializeMap();
      }
    }, 5000);
    
    initializeMap();

    return () => {
      clearTimeout(timer);
      cleanupExistingMap();
      console.log('Map cleanup completed');
    };
  }, [initializeMap, cleanupExistingMap]);

  const reinitializeMap = useCallback((forceNewInstance = false) => {
    console.log(`Reinitializing map with force=${forceNewInstance}`);
    // Reset the initialization in progress flag to ensure we can reinitialize
    initializationInProgressRef.current = false;
    // Reset the style loaded state to ensure we wait for the new style to load
    setIsStyleLoaded(false);
    return initializeMap(true);
  }, [initializeMap]);

  return { mapContainer, map, isStyleLoaded, reinitializeMap };
};
