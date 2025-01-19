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

      // Add unclustered points layer
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
              10, 4,  // At zoom level 10, circles will have size 4
              15, 8   // At zoom level 15, circles will have size 8
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
            'circle-opacity': 0.9
          }
        });

        // Add the text layer for brewery names
        map.addLayer({
          id: 'unclustered-point-label',
          type: 'symbol',
          source: source,
          filter: ['!', ['has', 'point_count']],
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Regular'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 0,    // Hide text at zoom level 10 and below
              11, 11    // Show text at zoom level 11 and above
            ],
            'text-offset': [0, 1.5],
            'text-anchor': 'top',
            'text-allow-overlap': false,
            'text-ignore-placement': false
          },
          paint: {
            'text-color': '#666',
            'text-halo-color': '#fff',
            'text-halo-width': 1
          }
        });
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
        if (map.getLayer('unclustered-point-label')) {
          map.removeLayer('unclustered-point-label');
        }
        if (map.getLayer('unclustered-point')) {
          map.removeLayer('unclustered-point');
        }
      } catch (error) {
        console.warn('Error cleaning up brewery points layer:', error);
      }
    };
  }, [map, source]);

  return null;
};

export default BreweryPoints;