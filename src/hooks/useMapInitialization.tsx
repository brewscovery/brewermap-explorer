
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/utils/mapUtils';
import { toast } from 'sonner';

export const useMapInitialization = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      // Initialize map without setting initial center and zoom
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11'
      });

      // Wait for map style to load before adding controls and layers
      map.current.on('style.load', () => {
        if (!map.current) return;
        
        setIsStyleLoaded(true);

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add geolocate control
        const geolocateControl = new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        });

        map.current.addControl(geolocateControl, 'top-right');
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
