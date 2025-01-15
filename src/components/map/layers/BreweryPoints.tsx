import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface BreweryPointsProps {
  map: mapboxgl.Map;
  source: string;
}

const BreweryPoints = ({ map, source }: BreweryPointsProps) => {
  useEffect(() => {
    const addLayer = () => {
      if (!map.getLayer('unclustered-point')) {
        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source,
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#51A4DB',
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }
        });
      }
    };

    const initializeLayer = () => {
      if (map.getSource(source)) {
        addLayer();
      } else {
        const checkSource = setInterval(() => {
          if (map.getSource(source)) {
            addLayer();
            clearInterval(checkSource);
          }
        }, 100);

        setTimeout(() => clearInterval(checkSource), 5000);
      }
    };

    if (map.loaded()) {
      initializeLayer();
    } else {
      map.once('load', initializeLayer);
    }

    return () => {
      // Only try to remove layer if the map still exists and is loaded
      if (map && !map.isStyleLoaded()) return;
      
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