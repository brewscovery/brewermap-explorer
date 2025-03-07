
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
    console.log('[Map] Initialize called, initializedRef:', initializedRef.current, 'mapContainer exists:', !!mapContainer.current);
    
    if (!mapContainer.current) {
      console.log('[Map] Cannot initialize: map container ref is null');
      return;
    }
    
    if (initializedRef.current && map.current) {
      console.log('[Map] Map already initialized, removing existing map instance');
      try {
        map.current.remove();
        console.log('[Map] Existing map instance removed successfully');
      } catch (error) {
        console.error('[Map] Error removing existing map:', error);
      }
      map.current = null;
      initializedRef.current = false;
    }
    
    try {
      console.log('[Map] Fetching Mapbox token');
      const token = await getMapboxToken();
      mapboxgl.accessToken = token;
      
      console.log('[Map] Creating new map instance');
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [133.7751, -25.2744], // Center of Australia
        zoom: 4
      });

      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      console.log('[Map] Navigation controls added');

      // Create and store the style load listener
      const onStyleLoad = () => {
        console.log('[Map] Style load event fired');
        if (newMap.isStyleLoaded()) {
          console.log('[Map] Style is already loaded, setting isStyleLoaded to true');
          setIsStyleLoaded(true);
        } else {
          console.log('[Map] Style not loaded yet, setting up interval check');
          // If style isn't loaded yet, wait for it
          const checkStyle = setInterval(() => {
            if (newMap.isStyleLoaded()) {
              console.log('[Map] Style loaded via interval check');
              clearInterval(checkStyle);
              setIsStyleLoaded(true);
            }
          }, 100);

          // Clean up interval after 5 seconds if style hasn't loaded
          setTimeout(() => {
            console.log('[Map] Cleaning up style check interval');
            clearInterval(checkStyle);
            if (!isStyleLoaded) {
              console.log('[Map] Style still not loaded after timeout, forcing isStyleLoaded to true');
              setIsStyleLoaded(true);
            }
          }, 5000);
        }
      };
      
      onStyleLoadRef.current = onStyleLoad;
      console.log('[Map] Style load listener created');

      // Add the event listener
      newMap.on('style.load', onStyleLoad);
      console.log('[Map] Style load event listener attached');

      // Check if style is already loaded
      if (newMap.isStyleLoaded()) {
        console.log('[Map] Style already loaded on init, calling onStyleLoad');
        onStyleLoad();
      }

      map.current = newMap;
      initializedRef.current = true;
      console.log('[Map] Map initialization completed successfully');
    } catch (error) {
      console.error('[Map] Error initializing map:', error);
      toast.error('Failed to initialize map');
      initializedRef.current = false;
    }
  }, [isStyleLoaded]);

  // Initial map setup
  useEffect(() => {
    console.log('[Map] Setup effect running, map ref exists:', !!map.current);
    initializeMap();

    return () => {
      console.log('[Map] Cleanup effect running');
      if (map.current && onStyleLoadRef.current) {
        try {
          console.log('[Map] Removing style.load event listener');
          map.current.off('style.load', onStyleLoadRef.current);
          console.log('[Map] Removing map instance');
          map.current.remove();
          console.log('[Map] Map cleanup completed successfully');
        } catch (error) {
          console.error('[Map] Error cleaning up map:', error);
        }
      }
      console.log('[Map] Resetting all refs and state');
      map.current = null;
      initializedRef.current = false;
      onStyleLoadRef.current = null;
      setIsStyleLoaded(false);
    };
  }, [initializeMap]);

  return { mapContainer, map, isStyleLoaded };
};
