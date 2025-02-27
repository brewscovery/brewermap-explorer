
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
      if (!map.getStyle() || !map.getSource(source)) {
        console.log('Map style or source not ready, skipping cluster layer addition');
        return;
      }

      if (layersAdded.current) {
        console.log('Cluster layers already added, skipping');
        return;
      }

      console.log('Adding cluster layers to map');

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

        layersAdded.current = true;
        console.log('Cluster layers added successfully');
      } catch (error) {
        console.error('Error adding cluster layers:', error);
      }
    };

    const initialize = () => {
      if (!map.isStyleLoaded()) {
        console.log('Map style not loaded, waiting for style load event');
        map.once('style.load', () => {
          setTimeout(() => {
            if (map.getSource(source)) {
              addLayers();
            } else {
              console.log('Source not found after style load, waiting for sourcedata event');
              map.once('sourcedata', (e) => {
                if (e.sourceId === source && e.isSourceLoaded) {
                  addLayers();
                }
              });
            }
          }, 100);
        });
        return;
      }

      // If style is already loaded, check for source
      if (map.getSource(source)) {
        addLayers();
      } else {
        console.log('Source not found, waiting for it to be added...');
        // Listen for the sourcedata event to know when our source is added
        map.once('sourcedata', (e) => {
          if (e.sourceId === source && e.isSourceLoaded) {
            addLayers();
          }
        });

        // Also set a timeout as fallback
        setTimeout(() => {
          if (!layersAdded.current && map.getSource(source)) {
            console.log('Adding cluster layers via timeout fallback');
            addLayers();
          }
        }, 1000);
      }
    };

    console.log('Initializing cluster layers component');
    initialize();

    return () => {
      if (!map.getStyle()) return;
      
      try {
        ['cluster-count', 'clusters'].forEach(layer => {
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
