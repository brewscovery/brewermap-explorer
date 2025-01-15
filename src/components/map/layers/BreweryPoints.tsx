import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface BreweryPointsProps {
  map: mapboxgl.Map;
  source: string;
}

const BreweryPoints = ({ map, source }: BreweryPointsProps) => {
  useEffect(() => {
    const addLayer = () => {
      // Add unclustered point layer
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
      // Only add layer if source exists
      if (map.getSource(source)) {
        addLayer();
      } else {
        // Wait for source to be added
        const checkSource = setInterval(() => {
          if (map.getSource(source)) {
            addLayer();
            clearInterval(checkSource);
          }
        }, 100);

        // Cleanup interval after 5 seconds if source never appears
        setTimeout(() => clearInterval(checkSource), 5000);
      }
    };

    if (map.loaded()) {
      initializeLayer();
    } else {
      map.once('load', initializeLayer);
    }

    return () => {
      if (map.getLayer('unclustered-point')) {
        map.removeLayer('unclustered-point');
      }
    };
  }, [map, source]);

  return null;
};

export default BreweryPoints;