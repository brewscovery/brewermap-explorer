import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface BreweryPointsProps {
  map: mapboxgl.Map;
  source: string;
}

const BreweryPoints = ({ map, source }: BreweryPointsProps) => {
  useEffect(() => {
    const addLayer = () => {
      // Wait for map style to be loaded
      if (!map.isStyleLoaded()) {
        map.once('style.load', addLayer);
        return;
      }

      // Check if source exists
      if (!map.getSource(source)) {
        console.log('Source not found, retrying...');
        setTimeout(addLayer, 100);
        return;
      }

      try {
        // Load the custom beer icon first
        map.loadImage(
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
          (error, image) => {
            if (error) {
              console.error('Error loading beer icon:', error);
              return;
            }
            
            if (!map.hasImage('beer') && image) {
              map.addImage('beer', image);
              
              // Only add the layer after the icon is loaded
              if (map.getLayer('unclustered-point')) {
                map.removeLayer('unclustered-point');
              }

              map.addLayer({
                id: 'unclustered-point',
                type: 'symbol',
                source: source,
                filter: ['!', ['has', 'point_count']],
                layout: {
                  'icon-image': 'beer',
                  'icon-size': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    10, 0.5,
                    15, 0.75,
                    20, 1
                  ],
                  'icon-allow-overlap': true,
                  'text-field': ['get', 'name'],
                  'text-font': ['Open Sans Regular'],
                  'text-size': 11,
                  'text-offset': [0, 1.5],
                  'text-anchor': 'top',
                  'text-allow-overlap': false,
                },
                paint: {
                  'text-color': '#666',
                  'text-halo-color': '#fff',
                  'text-halo-width': 1
                }
              });

              console.log('Added unclustered-point layer successfully');
            }
          }
        );
      } catch (error) {
        console.error('Error adding brewery points layer:', error);
      }
    };

    // Add layer when map is ready
    addLayer();

    return () => {
      if (!map.getStyle()) return;
      
      try {
        if (map.getLayer('unclustered-point')) {
          map.removeLayer('unclustered-point');
        }
        if (map.hasImage('beer')) {
          map.removeImage('beer');
        }
      } catch (error) {
        console.warn('Error cleaning up brewery points layer:', error);
      }
    };
  }, [map, source]);

  return null;
};

export default BreweryPoints;