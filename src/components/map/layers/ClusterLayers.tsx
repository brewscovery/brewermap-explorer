
import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface ClusterLayersProps {
  map: mapboxgl.Map;
  source: string;
}

const ClusterLayers = ({ map, source }: ClusterLayersProps) => {
  useEffect(() => {
    const addLayers = () => {
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
      } catch (error) {
        console.error('Error adding cluster layers:', error);
      }
    };

    // If the style and source are already loaded, add layers immediately
    if (map.isStyleLoaded() && map.getSource(source)) {
      addLayers();
    }

    // Also listen for the style.load event to handle initial load
    const onStyleLoad = () => {
      // Wait for source to be available before adding layers
      if (map.getSource(source)) {
        addLayers();
      } else {
        // If source isn't available yet, wait for sourcedata event
        const onSourceAdd = () => {
          if (map.getSource(source)) {
            addLayers();
            map.off('sourcedata', onSourceAdd);
          }
        };
        map.on('sourcedata', onSourceAdd);
      }
    };

    map.on('style.load', onStyleLoad);

    return () => {
      map.off('style.load', onStyleLoad);
      
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
