
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
  const tokenRef = useRef<string | null>(null);
  const [initializationAttempt, setInitializationAttempt] = useState(0);

  // Load token only once to avoid multiple API calls
  const loadMapboxToken = useCallback(async () => {
    if (tokenRef.current) return tokenRef.current;
    
    try {
      const token = await getMapboxToken();
      tokenRef.current = token;
      return token;
    } catch (error) {
      console.error('Failed to load Mapbox token:', error);
      toast.error('Failed to load map resources');
      throw error;
    }
  }, []);

  // Complete cleanup of map instance
  const cleanupMap = useCallback(() => {
    console.log('Cleaning up map resources completely');
    
    if (map.current) {
      try {
        if (onStyleLoadRef.current) {
          map.current.off('style.load', onStyleLoadRef.current);
          onStyleLoadRef.current = null;
        }
        
        // Remove all event listeners and the map
        map.current.remove();
      } catch (error) {
        console.error('Error during map cleanup:', error);
      }
    }
    
    // Reset all refs and state
    map.current = null;
    initializedRef.current = false;
    setIsStyleLoaded(false);
  }, []);

  const initializeMap = useCallback(async () => {
    // Don't initialize if container isn't available
    if (!mapContainer.current) {
      console.log('Map container not available, skipping initialization');
      return;
    }
    
    // If already initialized and map instance exists, don't reinitialize
    if (initializedRef.current && map.current && map.current.isStyleLoaded()) {
      console.log('Map already properly initialized, skipping initialization');
      setIsStyleLoaded(true);
      return;
    }
    
    // If we have a partial map instance, clean it up first
    if (map.current) {
      console.log('Cleaning up previous map instance before reinitializing');
      cleanupMap();
    }
    
    try {
      console.log('Starting map initialization (attempt:', initializationAttempt + 1, ')');
      const token = await loadMapboxToken();
      mapboxgl.accessToken = token;
      
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [133.7751, -25.2744], // Center of Australia
        zoom: 4,
        trackResize: true
      });

      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Create and store the style load listener
      const onStyleLoad = () => {
        console.log('Map style loaded successfully');
        if (newMap.isStyleLoaded()) {
          setIsStyleLoaded(true);
          initializedRef.current = true;
          console.log('Map fully initialized and ready');
        } else {
          console.log('Style not fully loaded yet, waiting...');
          // If style isn't loaded yet, wait for it
          const checkStyle = setInterval(() => {
            if (newMap.isStyleLoaded()) {
              clearInterval(checkStyle);
              setIsStyleLoaded(true);
              initializedRef.current = true;
              console.log('Map fully initialized after interval check');
            }
          }, 100);

          // Clean up interval after 5 seconds if style hasn't loaded
          setTimeout(() => clearInterval(checkStyle), 5000);
        }
      };
      
      onStyleLoadRef.current = onStyleLoad;

      // Add the event listener
      newMap.on('style.load', onStyleLoad);
      
      // Add additional error handling
      newMap.on('error', (e) => {
        console.error('Mapbox error:', e.error);
        toast.error('Map error occurred. Please refresh the page.');
      });

      // Check if style is already loaded (handles case where load event fired before listener added)
      if (newMap.isStyleLoaded()) {
        console.log('Map style was already loaded, initializing immediately');
        onStyleLoad();
      }

      map.current = newMap;
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map');
      
      // Reset initialization state on error
      cleanupMap();
      
      // Try again if reasonable number of attempts (max 3)
      if (initializationAttempt < 2) {
        console.log('Retrying map initialization...');
        setInitializationAttempt(prev => prev + 1);
      }
    }
  }, [cleanupMap, loadMapboxToken, initializationAttempt]);

  // Effect to retry initialization if previous attempt failed
  useEffect(() => {
    if (initializationAttempt > 0) {
      const retryTimer = setTimeout(() => {
        initializeMap();
      }, 1000); // Wait 1 second before retry
      
      return () => clearTimeout(retryTimer);
    }
  }, [initializationAttempt, initializeMap]);

  // Initial map setup - with proper cleanup
  useEffect(() => {
    console.log('Map hook mounted, initializing map');
    
    // Reset attempt counter on mount
    setInitializationAttempt(0);
    
    // Initialize the map
    initializeMap();

    // Full cleanup on unmount
    return () => {
      console.log('Map hook unmounting, cleaning up resources');
      cleanupMap();
    };
  }, [initializeMap, cleanupMap]);

  // Handle window resize events to ensure map resizes properly
  useEffect(() => {
    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return { mapContainer, map, isStyleLoaded, initializeMap };
};
