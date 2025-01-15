import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface BreweryPointsProps {
  map: mapboxgl.Map;
  source: string;
}

const BreweryPoints = ({ map, source }: BreweryPointsProps) => {
  useEffect(() => {
    const addLayer = () => {
      // Wait for map style and source to be loaded
      if (!map.isStyleLoaded() || !map.getSource(source)) {
        map.once('style.load', addLayer);
        return;
      }

      if (!map.getLayer('unclustered-point')) {
        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source,
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#51A4DB',
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7, // zoom level
              8, // circle radius
              16, // zoom level
              15 // circle radius
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }
        });
      }
    };

    // Add layer when map is ready
    if (map.isStyleLoaded() && map.getSource(source)) {
      addLayer();
    } else {
      map.on('load', () => {
        // Wait a brief moment for the source to be fully loaded
        setTimeout(addLayer, 100);
      });
    }

    return () => {
      if (!map || !map.getStyle()) return;
      
      try {
        if (map.getLayer('unclustered-point')) {
          map.removeLayer('unclustered-point');
        }
      } catch (error) {
        console.warn('Error cleaning up brewery points layer:', error);
      }
    };
  }, [map, source]);

  return null;
};

export default BreweryPoints;