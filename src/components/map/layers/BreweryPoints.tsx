
import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface BreweryPointsProps {
  map: mapboxgl.Map;
  source: string;
  visitedBreweryIds?: string[];
}

const BreweryPoints = ({ map, source, visitedBreweryIds = [] }: BreweryPointsProps) => {
  useEffect(() => {
    const addLayers = () => {
      try {
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
        } else {
          // Update the layer paint properties when visitedBreweryIds changes
          map.setPaintProperty('unclustered-point', 'circle-color', [
            'case',
            ['in', ['get', 'id'], ['literal', visitedBreweryIds]],
            '#22c55e', // Green color for visited breweries
            '#fbbf24'  // Default yellow color for unvisited breweries
          ]);
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
        }
      } catch (error) {
        console.error('Error adding point layers:', error);
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
        ['unclustered-point', 'unclustered-point-label'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
      } catch (error) {
        console.warn('Error cleaning up point layers:', error);
      }
    };
  }, [map, source, visitedBreweryIds]);

  return null;
};

export default BreweryPoints;
