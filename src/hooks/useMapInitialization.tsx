
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/utils/mapUtils';
import { toast } from 'sonner';

export const useMapInitialization = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!mapContainer.current || initializedRef.current) return;
    initializedRef.current = true;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [133.7751, -25.2744], // Center of Australia
        zoom: 4
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Wait for map style to load before adding controls and layers
      map.current.on('style.load', () => {
        if (!map.current) return;
        setIsStyleLoaded(true);

        // Center on Australia and block any immediate position changes
        map.current.jumpTo({
          center: [133.7751, -25.2744],
          zoom: 4,
        });
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map');
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  return { mapContainer, map, isStyleLoaded };
};
