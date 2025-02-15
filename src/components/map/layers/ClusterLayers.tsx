
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface ClusterLayersProps {
  map: mapboxgl.Map;
  source: string;
}

const ClusterLayers = ({ map, source }: ClusterLayersProps) => {
  const layersAdded = useRef(false);

  useEffect(() => {
    const addLayers = () => {
      if (!map.isStyleLoaded() || layersAdded.current) return;

      try {
        // Add clusters layer
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
                '#fbbf24', // Default color (amber-400)
                10,
                '#f59e0b', // >= 10 points (amber-500)
                50,
                '#d97706'  // >= 50 points (amber-600)
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,    // Default size
                10,    // Number of points
                30,    // Size when points >= 10
                50,    
                40     // Size when points >= 50
              ],
              'circle-stroke-width': 2,
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

        // Add unclustered point layer
        if (!map.getLayer('unclustered-point')) {
          map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: source,
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#fbbf24',
              'circle-radius': 12,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }
          });
        }

        // Add unclustered point label
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
        
        layersAdded.current = true;
        console.log('Cluster layers added successfully');
      } catch (error) {
        console.error('Error adding cluster layers:', error);
      }
    };

    const initialize = () => {
      if (!map.getSource(source)) {
        console.log('Waiting for source to be added...');
        const checkSource = setInterval(() => {
          if (map.getSource(source)) {
            clearInterval(checkSource);
            addLayers();
          }
        }, 100);

        return () => clearInterval(checkSource);
      }

      addLayers();
    };

    // Start initialization process
    if (map.isStyleLoaded()) {
      initialize();
    } else {
      map.once('style.load', initialize);
    }

    return () => {
      if (!map.getStyle()) return;
      
      try {
        ['cluster-count', 'clusters', 'unclustered-point', 'unclustered-point-label'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
        layersAdded.current = false;
      } catch (error) {
        console.warn('Error cleaning up cluster layers:', error);
      }
    };
  }, [map, source]);

  return null;
};

export default ClusterLayers;
