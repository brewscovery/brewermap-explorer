
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { getMapboxToken } from '@/utils/mapUtils';
import { toast } from 'sonner';

export const useMapInitialization = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const initializedRef = useRef(false);
  // Store the listener function reference
  const onStyleLoadRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
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

        // Add the event listener
        newMap.on('style.load', onStyleLoad);

        // Check if style is already loaded
        if (newMap.isStyleLoaded()) {
          onStyleLoad();
        }

        map.current = newMap;
        initializedRef.current = true;
      } catch (error) {
        console.error('Error initializing map:', error);
        toast.error('Failed to initialize map');
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (map.current && onStyleLoadRef.current) {
        try {
          // Remove event listener with both event name and listener function
          map.current.off('style.load', onStyleLoadRef.current);
          
          // Remove the map instance
          map.current.remove();
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
      // Reset refs
      map.current = null;
      initializedRef.current = false;
      onStyleLoadRef.current = null;
    };
  }, []);

  return { mapContainer, map, isStyleLoaded };
};
