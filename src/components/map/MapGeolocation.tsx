
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { toast } from 'sonner';

interface MapGeolocationProps {
  map: mapboxgl.Map;
}

const MapGeolocation = ({ map }: MapGeolocationProps) => {
  const hasAttemptedGeolocation = useRef(false);

  useEffect(() => {
    // Add a delay before attempting geolocation to ensure the initial view is stable
    const timer = setTimeout(() => {
      if (hasAttemptedGeolocation.current) return;
      hasAttemptedGeolocation.current = true;

      // Add geolocate control
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      });

      map.addControl(geolocateControl, 'bottom-right');
    }, 2000); // Wait 2 seconds before adding geolocation control

    return () => {
      clearTimeout(timer);
    };
  }, [map]);

  return null;
};

export default MapGeolocation;
