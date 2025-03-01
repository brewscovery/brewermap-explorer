
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface ClusterLayersProps {
  map: mapboxgl.Map;
  source: string;
}

const ClusterLayers = ({ map, source }: ClusterLayersProps) => {
  const layersAdded = useRef(false);
  const addAttempts = useRef(0);
  const maxAttempts = 10;

  useEffect(() => {
    // Function to add cluster layers to the map
    const addLayers = () => {
      if (layersAdded.current) {
        console.log('Cluster layers already added, skipping');
        return true;
      }

      if (!map.getSource(source)) {
        console.log('Source not found, cannot add cluster layers');
        return false;
      }

      try {
        console.log('Adding cluster layers to map');

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

        layersAdded.current = true;
        console.log('Cluster layers added successfully');
        return true;
      } catch (error) {
        console.error('Error adding cluster layers:', error);
        return false;
      }
    };

    // Try to add layers if the style and source are ready
    const attemptToAddLayers = () => {
      addAttempts.current++;
      
      if (addAttempts.current > maxAttempts) {
        console.warn('Exceeded maximum attempts to add cluster layers');
        return;
      }

      // Make sure map is available
      if (!map) {
        console.warn('Map not available for cluster layers');
        return;
      }

      console.log(`Attempt ${addAttempts.current} to add cluster layers`);
      
      // Check if style is loaded and try to add layers
      if (map.isStyleLoaded()) {
        if (addLayers()) {
          // Success, no need for further attempts
          return;
        }
      }
      
      // Schedule another attempt
      setTimeout(attemptToAddLayers, 300);
    };

    // Start the process
    attemptToAddLayers();

    // Cleanup function
    return () => {
      if (!map.getStyle()) return;
      
      try {
        ['cluster-count', 'clusters'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
        layersAdded.current = false;
        addAttempts.current = 0;
      } catch (error) {
        console.warn('Error cleaning up cluster layers:', error);
      }
    };
  }, [map, source]);

  return null;
};

export default ClusterLayers;
