
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface BreweryPointsProps {
  map: mapboxgl.Map;
  source: string;
  visitedBreweryIds?: string[];
}

const BreweryPoints = ({ map, source, visitedBreweryIds = [] }: BreweryPointsProps) => {
  const layersAdded = useRef(false);
  const addAttempts = useRef(0);
  const maxAttempts = 10;

  useEffect(() => {
    // Function to update the color of brewery points based on visited status
    const updatePointColors = () => {
      if (!map.getLayer('unclustered-point')) return;

      // Update the layer paint properties when visitedBreweryIds changes
      map.setPaintProperty('unclustered-point', 'circle-color', [
        'case',
        ['in', ['get', 'id'], ['literal', visitedBreweryIds]],
        '#22c55e', // Green color for visited breweries
        '#fbbf24'  // Default yellow color for unvisited breweries
      ]);
      
      console.log('Updated point colors with visited breweries:', visitedBreweryIds);
    };

    // Function to add brewery point layers to the map
    const addLayers = () => {
      if (layersAdded.current) {
        // If layers already added, just update colors
        updatePointColors();
        return true;
      }

      if (!map.getSource(source)) {
        console.log('Source not found, cannot add brewery point layers');
        return false;
      }

      try {
        console.log('Adding brewery point layers');

        // Add unclustered point layer
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

        layersAdded.current = true;
        console.log('Point layers added successfully');
        return true;
      } catch (error) {
        console.error('Error adding brewery point layers:', error);
        return false;
      }
    };

    // Try to add layers if the style and source are ready
    const attemptToAddLayers = () => {
      addAttempts.current++;
      
      if (addAttempts.current > maxAttempts) {
        console.warn('Exceeded maximum attempts to add brewery point layers');
        return;
      }

      // Make sure map is available
      if (!map) {
        console.warn('Map not available for brewery points');
        return;
      }

      console.log(`Attempt ${addAttempts.current} to add brewery point layers`);
      
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

    // Update colors when visitedBreweryIds changes
    if (layersAdded.current) {
      updatePointColors();
    }

    // Cleanup function
    return () => {
      if (!map.getStyle()) return;
      
      try {
        ['unclustered-point', 'unclustered-point-label'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
        layersAdded.current = false;
        addAttempts.current = 0;
      } catch (error) {
        console.warn('Error cleaning up brewery point layers:', error);
      }
    };
  }, [map, source, visitedBreweryIds]);

  return null;
};

export default BreweryPoints;
