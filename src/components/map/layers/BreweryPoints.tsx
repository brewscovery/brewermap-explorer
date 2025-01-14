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

    if (map.loaded()) {
      addLayer();
    } else {
      map.once('load', addLayer);
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