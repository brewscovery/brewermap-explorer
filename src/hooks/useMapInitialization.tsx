
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { getMapboxToken } from '@/utils/mapUtils';

interface MapInitializationResult {
  mapContainer: React.RefObject<HTMLDivElement>;
  map: React.RefObject<mapboxgl.Map>;
  isStyleLoaded: boolean;
  resizeMap: () => void;
}

export const useMapInitialization = (): MapInitializationResult => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);

  // Initialize the map on component mount
  useEffect(() => {
    const initializeMap = async () => {
      try {
        if (!mapContainer.current) return;
        
        // Get the Mapbox token from Supabase
        const token = await getMapboxToken();
        mapboxgl.accessToken = token;
        
        // Initialize the map
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-96, 38], // Center on US
          zoom: 3
        });
        
        // Set up event handlers
        map.current.on('style.load', () => {
          console.log('Map style loaded');
          setIsStyleLoaded(true);
        });
        
        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };
    
    initializeMap();
    
    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Function to resize the map when its container changes
  const resizeMap = () => {
    if (map.current) {
      map.current.resize();
      console.log('Map resized');
    }
  };

  return { mapContainer, map, isStyleLoaded, resizeMap };
};
