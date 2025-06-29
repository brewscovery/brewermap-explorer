
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { getMapboxToken } from '@/utils/mapUtils';
import { toast } from 'sonner';

export const useOptimizedMapInitialization = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState(0);
  const initializedRef = useRef(false);
  const onStyleLoadRef = useRef<(() => void) | null>(null);

  const initializeMap = useCallback(async () => {
    if (!mapContainer.current || initializedRef.current || isInitializing) return;
    
    setIsInitializing(true);
    setInitializationProgress(10);
    
    try {
      console.log('Starting optimized map initialization...');
      
      // Step 1: Get token (non-blocking)
      setInitializationProgress(20);
      const token = await getMapboxToken();
      mapboxgl.accessToken = token;
      
      setInitializationProgress(40);
      
      // Step 2: Create map with optimized settings
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [133.7751, -25.2744], // Center of Australia
        zoom: 4,
        preserveDrawingBuffer: true,
        // Performance optimizations
        antialias: false, // Disable for better performance
        maxZoom: 18,
        minZoom: 2,
        // Reduce initial render complexity
        renderWorldCopies: false
      });

      setInitializationProgress(60);

      // Add navigation controls to bottom-right (non-blocking)
      setTimeout(() => {
        if (newMap && !newMap._removed) {
          newMap.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
        }
      }, 100);

      setInitializationProgress(80);

      // Create optimized style load listener
      const onStyleLoad = () => {
        console.log('Map style loaded - optimized');
        
        // Use requestAnimationFrame for smooth loading
        requestAnimationFrame(() => {
          if (newMap.loaded() && newMap.isStyleLoaded() && newMap.getStyle()) {
            console.log('Map fully ready - optimized path');
            setIsStyleLoaded(true);
            setInitializationProgress(100);
            setIsInitializing(false);
          } else {
            // Fallback with shorter timeout
            setTimeout(() => {
              if (newMap.loaded() && newMap.isStyleLoaded() && newMap.getStyle()) {
                console.log('Map ready after fallback check');
                setIsStyleLoaded(true);
                setInitializationProgress(100);
                setIsInitializing(false);
              }
            }, 100);
          }
        });
      };
      
      onStyleLoadRef.current = onStyleLoad;
      newMap.on('style.load', onStyleLoad);

      // Also listen for load event with timeout
      const loadTimeout = setTimeout(() => {
        if (!isStyleLoaded && newMap.isStyleLoaded()) {
          console.log('Map load timeout - forcing ready state');
          setIsStyleLoaded(true);
          setInitializationProgress(100);
          setIsInitializing(false);
        }
      }, 3000); // 3 second timeout

      newMap.on('load', () => {
        clearTimeout(loadTimeout);
        console.log('Map load event fired');
        if (newMap.isStyleLoaded() && newMap.getStyle()) {
          setIsStyleLoaded(true);
          setInitializationProgress(100);
          setIsInitializing(false);
        }
      });

      map.current = newMap;
      initializedRef.current = true;
      
      console.log('Map initialization completed');
    } catch (error) {
      console.error('Error in optimized map initialization:', error);
      setIsInitializing(false);
      setInitializationProgress(0);
      toast.error('Failed to initialize map');
    }
  }, [isInitializing, isStyleLoaded]);

  // Start initialization immediately but non-blocking
  useEffect(() => {
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => initializeMap(), { timeout: 1000 });
    } else {
      setTimeout(initializeMap, 0);
    }

    return () => {
      if (map.current && onStyleLoadRef.current) {
        try {
          if (onStyleLoadRef.current) {
            map.current.off('style.load', onStyleLoadRef.current);
          }
          
          if (map.current && !map.current._removed) {
            map.current.remove();
          }
          
          console.log('Optimized map cleanup completed');
        } catch (error) {
          console.error('Error cleaning up optimized map:', error);
        }
      }
      
      map.current = null;
      initializedRef.current = false;
      onStyleLoadRef.current = null;
      setIsStyleLoaded(false);
      setIsInitializing(false);
      setInitializationProgress(0);
    };
  }, [initializeMap]);

  return { 
    mapContainer, 
    map, 
    isStyleLoaded, 
    isInitializing, 
    initializationProgress 
  };
};
