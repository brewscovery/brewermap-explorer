import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface BreweryPointsProps {
  map: mapboxgl.Map;
  source: string;
}

const BreweryPoints = ({ map, source }: BreweryPointsProps) => {
  useEffect(() => {
    const addLayers = () => {
      if (!map.isStyleLoaded()) {
        requestAnimationFrame(addLayers);
        return;
      }

      if (!map.getSource(source)) {
        requestAnimationFrame(addLayers);
        return;
      }

      try {
        // Add unclustered point layer
        if (!map.getLayer('unclustered-point')) {
          map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: source,
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#fbbf24',
              'circle-radius': 10,
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff'
            }
          });
        }

        // Add text labels for unclustered points
        if (!map.getLayer('unclustered-point-label')) {
          map.addLayer({
            id: 'unclustered-point-label',
            type: 'symbol',
            source: source,
            filter: ['!', ['has', 'point_count']],
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12,
              'text-offset': [0, 1.5],
              'text-anchor': 'top'
            },
            paint: {
              'text-color': '#374151',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2
            }
          });
        }

        console.log('Point layers added successfully');
      } catch (error) {
        console.error('Error adding point layers:', error);
      }
    };

    addLayers();

    return () => {
      if (!map.getStyle()) return;
      
      try {
        ['unclustered-point', 'unclustered-point-label'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
      } catch (error) {
        console.warn('Error cleaning up point layers:', error);
      }
    };
  }, [map, source]);

  return null;
};

export default BreweryPoints;