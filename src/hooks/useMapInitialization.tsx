
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
    onStyleLoadRef.current = null;
    setIsStyleLoaded(false);
  }, []);

  const initializeMap = useCallback(async () => {
    // Don't initialize if container isn't available
    if (!mapContainer.current) {
      console.log('Map container not available, skipping initialization');
      return;
    }
    
    // If already initialized, don't reinitialize
    if (initializedRef.current && map.current) {
      console.log('Map already initialized, skipping initialization');
      return;
    }
    
    // If we have a map instance but not marked as initialized, clean it up first
    if (map.current && !initializedRef.current) {
      cleanupMap();
    }
    
    try {
      console.log('Starting map initialization');
      const token = await loadMapboxToken();
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
        console.log('Map style loaded successfully');
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
      console.log('Map initialization completed successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map');
      // Reset initialization state on error
      cleanupMap();
    }
  }, [cleanupMap, loadMapboxToken]);

  // Initial map setup - with proper cleanup
  useEffect(() => {
    console.log('Map hook mounted, initializing map');
    let isMounted = true;
    
    const setupMap = async () => {
      if (isMounted) {
        await initializeMap();
      }
    };
    
    setupMap();

    return () => {
      console.log('Map hook unmounting, cleaning up resources');
      isMounted = false;
      cleanupMap();
    };
  }, [initializeMap, cleanupMap]);

  return { mapContainer, map, isStyleLoaded };
};
