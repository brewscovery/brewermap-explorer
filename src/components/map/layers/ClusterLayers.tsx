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
        console.log('Waiting for map style to load before adding cluster layers...');
        requestAnimationFrame(addLayers);
        return;
      }

      if (!map.getSource(source)) {
        console.log('Source not found, retrying cluster layers...');
        requestAnimationFrame(addLayers);
        return;
      }

      try {
        // Add clusters layer if it doesn't exist
        if (!map.getLayer('clusters')) {
          map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: source,
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#fbbf24',
                10,
                '#f59e0b',
                30,
                '#d97706'
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                30,
                10,
                35,
                30,
                40
              ],
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 1
            }
          });
          console.log('Clusters layer added successfully');
        }

        // Add cluster count layer if it doesn't exist
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
          console.log('Cluster count layer added successfully');
        }
      } catch (error) {
        console.error('Error adding cluster layers:', error);
      }
    };

    // Initial attempt to add layers
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