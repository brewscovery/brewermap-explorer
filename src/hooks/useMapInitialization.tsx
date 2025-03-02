
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
  const lastTokenFetchTimeRef = useRef(0);
  const fallbackTokenRef = useRef<string | null>(null);
  
  // Function to completely clean up an existing map instance
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

  // Function to completely reset all map initialization state
  const resetMapInitializationState = useCallback(() => {
    console.log('COMPLETE RESET: Resetting all map initialization state');
    
    // Clean up existing map instance
    cleanupExistingMap();
    
    // Reset all state variables
    initializedRef.current = false;
    setIsStyleLoaded(false);
    initializationInProgressRef.current = false;
    tokenRetryCount.current = 0;
    lastTokenFetchTimeRef.current = 0;
    
    // Clear any stored map token cache to force fresh fetch
    localStorage.removeItem('mapbox_token');
    localStorage.removeItem('mapbox_token_timestamp');
    
    console.log('Map initialization state has been completely reset');
    return true;
  }, [cleanupExistingMap]);

  // Function to get a token, with caching and fallbacks
  const getToken = useCallback(async (forceFresh = false) => {
    const now = Date.now();
    const cachedToken = localStorage.getItem('mapbox_token');
    const cachedTimestamp = parseInt(localStorage.getItem('mapbox_token_timestamp') || '0');
    const cacheAge = now - cachedTimestamp;
    const MAX_CACHE_AGE = 60 * 60 * 1000; // 1 hour
    
    // Use cached token if it exists and isn't too old, unless forced to refresh
    if (!forceFresh && cachedToken && cacheAge < MAX_CACHE_AGE) {
      console.log(`Using cached Mapbox token (${Math.round(cacheAge/1000/60)} minutes old)`);
      return cachedToken;
    }
    
    // Avoid hammering the token endpoint
    const MIN_FETCH_INTERVAL = 5000; // 5 seconds
    if (now - lastTokenFetchTimeRef.current < MIN_FETCH_INTERVAL) {
      console.log('Token fetch throttled, using fallback');
      
      // First try cached token even if it's older than normal cache time
      if (cachedToken) {
        console.log('Using expired cached token as fallback');
        return cachedToken;
      }
      
      // Next try our in-memory fallback
      if (fallbackTokenRef.current) {
        console.log('Using in-memory fallback token');
        return fallbackTokenRef.current;
      }
      
      // Last resort, use hardcoded fallback
      console.log('Using hardcoded fallback token');
      return 'pk.eyJ1IjoiYnJld2Vyc21hcCIsImEiOiJjbHJlNG54OWowM2h2Mmpxa2cxZTlrMWFrIn0.DoCEzsoXFHJB4m-f7NmKLQ';
    }
    
    try {
      console.log('Fetching fresh Mapbox token...');
      lastTokenFetchTimeRef.current = now;
      
      const token = await getMapboxToken();
      console.log('Fresh Mapbox token retrieved successfully');
      
      // Cache the token
      localStorage.setItem('mapbox_token', token);
      localStorage.setItem('mapbox_token_timestamp', now.toString());
      
      // Store as fallback
      fallbackTokenRef.current = token;
      
      return token;
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      
      // If we have a previous fallback, use it
      if (fallbackTokenRef.current) {
        console.log('Using in-memory fallback after fetch error');
        return fallbackTokenRef.current;
      }
      
      // If we have a cached token, use it regardless of age in case of error
      if (cachedToken) {
        console.log('Using expired cached token after fetch error');
        return cachedToken;
      }
      
      // Last resort fallback
      const fallbackToken = 'pk.eyJ1IjoiYnJld2Vyc21hcCIsImEiOiJjbHJlNG54OWowM2h2Mmpxa2cxZTlrMWFrIn0.DoCEzsoXFHJB4m-f7NmKLQ';
      console.log('Using hardcoded fallback token after fetch error');
      return fallbackToken;
    }
  }, []);

  // Function to initialize the map
  const initializeMap = useCallback(async (force = false) => {
    console.log(`Initializing map (force=${force})`);
    
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
      return true;
    }
    
    try {
      // Set flag to prevent multiple simultaneous initializations
      initializationInProgressRef.current = true;
      
      // Clean up existing map if forcing reinitialization
      if (force && map.current) {
        cleanupExistingMap();
      }

      // Get the Mapbox token, forcing fresh on first try of forced init
      console.log('Getting Mapbox token...');
      const token = await getToken(force);
      
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
        renderWorldCopies: false, // Performance improvement
        attributionControl: false // Hide attribution for cleaner look
      });

      // Add a minimal attribution control (required by Mapbox TOS)
      newMap.addControl(new mapboxgl.AttributionControl({
        compact: true
      }));

      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl({
        showCompass: false, // Simpler controls for better performance
        showZoom: true
      }), 'top-right');

      map.current = newMap;
      
      // Track all event listeners added to the map for proper cleanup
      const addMapListener = (type: string, listener: any) => {
        newMap.on(type, listener);
        mapEventListenersRef.current.push({ type, listener });
      };
      
      // Add error handler for the map
      addMapListener('error', (e: any) => {
        console.error('Map error:', e.error);
        
        // Only show toast if not a common error type that can be recovered from
        if (e.error.status !== 401 && e.error.status !== 429) {
          toast.error('Map error occurred. Please refresh the page.');
        }
      });

      // Set initialized flag before style load
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
          console.log('Style not loaded yet after style.load event, checking again');
          
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
      
      console.log('Map initialization completed successfully');
      return true;
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map. Please refresh the page.');
      
      // Reset flags to allow future attempts
      initializationInProgressRef.current = false;
      
      return false;
    }
  }, [cleanupExistingMap, getToken]);

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

  // Function to force map reinitialization
  const reinitializeMap = useCallback((forceNewInstance = false) => {
    console.log(`Reinitializing map with force=${forceNewInstance}`);
    
    // Force reset the initialization flag if we're forcing a new instance
    if (forceNewInstance) {
      console.log('Forcing map reinitialization, resetting in-progress flag');
      initializationInProgressRef.current = false;
    }
    
    // Reset the style loaded state to ensure we wait for the new style to load
    setIsStyleLoaded(false);
    
    return initializeMap(forceNewInstance);
  }, [initializeMap]);

  return { 
    mapContainer, 
    map, 
    isStyleLoaded, 
    reinitializeMap, 
    resetMapInitializationState
  };
};
