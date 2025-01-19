import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface BreweryPointsProps {
  map: mapboxgl.Map;
  source: string;
}

const BreweryPoints = ({ map, source }: BreweryPointsProps) => {
  useEffect(() => {
    const addLayer = () => {
      if (!map.getSource(source)) {
        console.log('Source not found, retrying...');
        setTimeout(addLayer, 100);
        return;
      }

      try {
        // Load the custom marker icon
        map.loadImage(
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
          (error, image) => {
            if (error) {
              console.error('Error loading marker icon:', error);
              return;
            }
            
            if (!map.hasImage('brewery-marker') && image) {
              map.addImage('brewery-marker', image);
              
              // Add the layer for individual breweries
              if (!map.getLayer('unclustered-point')) {
                map.addLayer({
                  id: 'unclustered-point',
                  type: 'symbol',
                  source: source,
                  filter: ['!', ['has', 'point_count']],
                  layout: {
                    'icon-image': 'brewery-marker',
                    'icon-size': 0.5,
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
              }
            }
          }
        );
      } catch (error) {
        console.error('Error adding brewery points layer:', error);
      }
    };

    // Wait for style to be loaded before adding layer
    if (!map.isStyleLoaded()) {
      map.once('style.load', addLayer);
    } else {
      addLayer();
    }

    return () => {
      if (!map.getStyle()) return;
      
      try {
        if (map.getLayer('unclustered-point')) {
          map.removeLayer('unclustered-point');
        }
        if (map.hasImage('brewery-marker')) {
          map.removeImage('brewery-marker');
        }
      } catch (error) {
        console.warn('Error cleaning up brewery points layer:', error);
      }
    };
  }, [map, source]);

  return null;
};

export default BreweryPoints;