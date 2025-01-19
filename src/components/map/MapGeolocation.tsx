import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { toast } from 'sonner';

interface MapGeolocationProps {
  map: mapboxgl.Map;
}

const MapGeolocation = ({ map }: MapGeolocationProps) => {
  useEffect(() => {
    try {
      // Try to get user location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            // Create a simple coordinates object to avoid cloning issues
            const coordinates = {
              lng: position.coords.longitude,
              lat: position.coords.latitude
            };
            
            map.flyTo({
              center: [coordinates.lng, coordinates.lat],
              zoom: 9,
              essential: true
            });
          } catch (error) {
            console.error('Error flying to location:', error);
            toast.error('Error moving map to your location');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location. Showing Australia view.');
          map.flyTo({
            center: [133.7751, -25.2744],
            zoom: 4,
            essential: true
          });
        }
      );
    } catch (error) {
      console.error('Error in geolocation component:', error);
    }
  }, [map]);

  return null;
};

export default MapGeolocation;