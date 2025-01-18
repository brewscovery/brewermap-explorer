import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface BreweryPointsProps {
  map: mapboxgl.Map;
  source: string;
}

const BreweryPoints = ({ map, source }: BreweryPointsProps) => {
  useEffect(() => {
    const addLayer = () => {
      // Wait for map style to be loaded
      if (!map.isStyleLoaded()) {
        map.once('style.load', addLayer);
        return;
      }

      // Check if source exists
      if (!map.getSource(source)) {
        console.log('Source not found, retrying...');
        setTimeout(addLayer, 100);
        return;
      }

      try {
        if (map.getLayer('unclustered-point')) {
          map.removeLayer('unclustered-point');
        }

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
              7, 5,  // At zoom level 7, radius is 5px
              12, 8, // At zoom level 12, radius is 8px
              16, 12 // At zoom level 16, radius is 12px
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }
        });

        console.log('Added unclustered-point layer');
      } catch (error) {
        console.error('Error adding brewery points layer:', error);
      }
    };

    // Add layer when map is ready
    addLayer();

    return () => {
      if (!map.getStyle()) return;
      
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