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
              10, 8,   // At zoom level 10, circles will have size 8
              15, 15   // At zoom level 15, circles will have size 15
            ],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 1
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
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 0,    // Hide text at zoom level 10 and below
              11, 14    // Show text at zoom level 11 and above
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