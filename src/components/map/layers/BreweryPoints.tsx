
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
      if (!map.isStyleLoaded()) {
        console.log('Waiting for map style to load before adding point layers...');
        requestAnimationFrame(addLayers);
        return;
      }

      if (!map.getSource(source)) {
        console.log('Waiting for source to be available before adding point layers...');
        requestAnimationFrame(addLayers);
        return;
      }

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
          console.log('Added unclustered point layer');
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
          console.log('Added unclustered point label layer');
        }
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
  }, [map, source, visitedBreweryIds]);

  return null;
};

export default BreweryPoints;
