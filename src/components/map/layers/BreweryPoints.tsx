import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface BreweryPointsProps {
  map: mapboxgl.Map;
  source: string;
}

const BreweryPoints = ({ map, source }: BreweryPointsProps) => {
  useEffect(() => {
    if (!map.isStyleLoaded()) return;

    // Add unclustered point layer
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

    return () => {
      if (map.getLayer('unclustered-point')) {
        map.removeLayer('unclustered-point');
      }
    };
  }, [map, source]);

  return null;
};

export default BreweryPoints;