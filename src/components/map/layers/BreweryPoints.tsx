import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface BreweryPointsProps {
  map: mapboxgl.Map;
  source: string;
}

const BreweryPoints = ({ map, source }: BreweryPointsProps) => {
  useEffect(() => {
    const addLayer = () => {
      if (!map.getStyle() || !map.getSource(source)) {
        setTimeout(addLayer, 100);
        return;
      }

      try {
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
                7,
                8,
                16,
                15
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fff'
            }
          });
        }
      } catch (error) {
        console.warn('Error adding brewery points layer:', error);
      }
    };

    // Add layer when map is ready
    if (map.isStyleLoaded()) {
      addLayer();
    } else {
      map.once('style.load', addLayer);
    }

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