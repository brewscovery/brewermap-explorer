
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface BreweryPointsProps {
  map: mapboxgl.Map;
  source: string;
  visitedBreweryIds?: string[];
}

const BreweryPoints = ({ map, source, visitedBreweryIds = [] }: BreweryPointsProps) => {
  const layersAdded = useRef(false);

  useEffect(() => {
    const updatePointColors = () => {
      if (!map.getLayer('unclustered-point')) return;

      // Update the layer paint properties when visitedBreweryIds changes
      map.setPaintProperty('unclustered-point', 'circle-color', [
        'case',
        ['in', ['get', 'id'], ['literal', visitedBreweryIds]],
        '#22c55e', // Green color for visited breweries
        '#fbbf24'  // Default yellow color for unvisited breweries
      ]);
    };

    const addLayers = () => {
      try {
        if (!map.getSource(source)) {
          console.log('Source not available yet, waiting...');
          return;
        }

        console.log('Adding brewery point layers');

        // Add unclustered point layer with conditional colors
        if (!map.getLayer('unclustered-point')) {
          map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: source,
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': [
                'case',
                ['in', ['get', 'id'], ['literal', visitedBreweryIds]],
                '#22c55e', // Green color for visited breweries
                '#fbbf24'  // Default yellow color for unvisited breweries
              ],
              'circle-radius': 12,
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff'
            }
          });

          // Add text labels for unclustered points
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
              'text-anchor': 'top',
              'text-allow-overlap': false,
              'text-ignore-placement': false
            },
            paint: {
              'text-color': '#374151',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2
            }
          });

          layersAdded.current = true;
          console.log('Point layers added successfully');
        } else {
          // Update colors if layers already exist
          updatePointColors();
        }
      } catch (error) {
        console.error('Error adding point layers:', error);
      }
    };

    const initialize = () => {
      // Wait for source to be loaded before adding layers
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
      } else {
        if (map.getSource(source)) {
          addLayers();
        } else {
          console.log('Source not found, waiting for sourcedata event');
          map.once('sourcedata', (e) => {
            if (e.sourceId === source && e.isSourceLoaded) {
              addLayers();
            }
          });
        }
      }
    };

    console.log('Initializing brewery points component');
    initialize();

    // Listen for changes to visitedBreweryIds and update colors
    if (layersAdded.current) {
      updatePointColors();
    }

    return () => {
      if (!map.getStyle()) return;
      
      try {
        ['unclustered-point', 'unclustered-point-label'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
        layersAdded.current = false;
      } catch (error) {
        console.warn('Error cleaning up point layers:', error);
      }
    };
  }, [map, source, visitedBreweryIds]);

  return null;
};

export default BreweryPoints;
