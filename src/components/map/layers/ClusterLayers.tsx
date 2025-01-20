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
        console.log('Waiting for source to be available before adding cluster layers...');
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
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,    // Size for points with count < 10
                10,    
                30,    // Size for points with count < 50
                50,    
                40     // Size for points with count >= 50
              ],
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff'
            }
          });
          console.log('Added clusters layer');
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
          console.log('Added cluster count layer');
        }
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