import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface BreweryPointsProps {
  map: mapboxgl.Map;
  source: string;
}

const BreweryPoints = ({ map, source }: BreweryPointsProps) => {
  useEffect(() => {
    const addLayers = () => {
      if (!map.isStyleLoaded()) {
        console.log('Waiting for map style to load before adding point layers...');
        requestAnimationFrame(addLayers);
        return;
      }

      if (!map.getSource(source)) {
        console.log('Source not found, retrying point layers...');
        requestAnimationFrame(addLayers);
        return;
      }

      try {
        // Add unclustered point layer if it doesn't exist
        if (!map.getLayer('unclustered-point')) {
          map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: source,
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#fbbf24',
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 8,
                15, 15
              ],
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 1
            }
          });
          console.log('Unclustered point layer added successfully');
        }

        // Add text labels for unclustered points if they don't exist
        if (!map.getLayer('unclustered-point-label')) {
          map.addLayer({
            id: 'unclustered-point-label',
            type: 'symbol',
            source: source,
            filter: ['!', ['has', 'point_count']],
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 0,
                11, 14
              ],
              'text-offset': [0, 2],
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
          console.log('Unclustered point label layer added successfully');
        }
      } catch (error) {
        console.error('Error adding point layers:', error);
      }
    };

    // Initial attempt to add layers
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
  }, [map, source]);

  return null;
};

export default BreweryPoints;