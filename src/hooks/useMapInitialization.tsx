
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
    }
  }, []);

  // Complete reset of all map initialization state
  const resetMapInitializationState = useCallback(() => {
    console.log('Completely resetting map initialization state');
    
    // Clean up existing map instance
    cleanupExistingMap();
    
    // Reset all state variables
    initializedRef.current = false;
    setIsStyleLoaded(false);
    initializationInProgressRef.current = false;
    tokenRetryCount.current = 0;
    
    // Clear any stored map token in localStorage to force fresh fetch
    localStorage.removeItem('mapbox_token');
    
    console.log('Map initialization state completely reset');
    return true;
  }, [cleanupExistingMap]);

  const initializeMap = useCallback(async (force = false) => {
    if (!mapContainer.current) {
      console.warn('Map container ref is not available');
      return false;
    }
    
    // If already initializing and not forcing, prevent concurrent initialization
    if (initializationInProgressRef.current && !force) {
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
      
      if (!token) {
        console.error('No token available, aborting map initialization');
        initializationInProgressRef.current = false;
        return false;
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
        preserveDrawingBuffer: true, // Ensure map renders correctly
        fadeDuration: 0, // Reduce transition animations for faster rendering
        renderWorldCopies: false // Performance improvement
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
        toast.error('Map error occurred. Please refresh the page.');
      });

      // Set initialized flag before style load to prevent multiple initializations
      initializedRef.current = true;

      // Create and store the style load listener
      const onStyleLoad = () => {
        console.log('Map style loaded event fired');
        
        // Ensure style is fully loaded before proceeding
        if (newMap.isStyleLoaded()) {
          console.log('Style is loaded, setting isStyleLoaded to true');
          setIsStyleLoaded(true);
          // Reset initialization flag once style is loaded successfully
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
      
      // Reset flags to allow future attempts
      initializationInProgressRef.current = false;
      
      return false;
    }
  }, [cleanupExistingMap]);

  // Initial map setup
  useEffect(() => {
    console.log('Map initialization effect running');
    
    const initializeAndRetry = async () => {
      const success = await initializeMap();
      
      // If initial attempt fails, try one more time after a delay
      if (!success && !initializedRef.current) {
        console.log('Initial map initialization failed, scheduling automatic retry');
        const timer = setTimeout(() => {
          console.log('Initial map initialization not completed, trying again automatically');
          initializeMap(true);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    };
    
    initializeAndRetry();

    return () => {
      cleanupExistingMap();
      console.log('Map cleanup completed');
    };
  }, [initializeMap, cleanupExistingMap]);

  const reinitializeMap = useCallback((forceNewInstance = false) => {
    console.log(`Reinitializing map with force=${forceNewInstance}`);
    
    // If forcing, make sure we reset the initialization flag to allow reinit
    if (forceNewInstance) {
      initializationInProgressRef.current = false;
    }
    
    // Reset the style loaded state to ensure we wait for the new style to load
    setIsStyleLoaded(false);
    return initializeMap(forceNewInstance);
  }, [initializeMap]);

  return { mapContainer, map, isStyleLoaded, reinitializeMap, resetMapInitializationState };
};
