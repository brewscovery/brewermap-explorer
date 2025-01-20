import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface ClusterLayersProps {
  map: mapboxgl.Map;
  source: string;
}

const ClusterLayers = ({ map, source }: ClusterLayersProps) => {
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
        // Add clusters layer
        if (!map.getLayer('clusters')) {
          map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: source,
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#fbbf24',
              'circle-radius': 20,
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff'
            }
          });
        }

        // Add cluster count layer
        if (!map.getLayer('cluster-count')) {
          map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: source,
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 14
            },
            paint: {
              'text-color': '#ffffff'
            }
          });
        }

        console.log('Cluster layers added successfully');
      } catch (error) {
        console.error('Error adding cluster layers:', error);
      }
    };

    addLayers();

    return () => {
      if (!map.getStyle()) return;
      
      try {
        ['cluster-count', 'clusters'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
      } catch (error) {
        console.warn('Error cleaning up cluster layers:', error);
      }
    };
  }, [map, source]);

  return null;
};

export default ClusterLayers;