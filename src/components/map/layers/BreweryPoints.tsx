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
        console.log('Map style not loaded yet, waiting...');
        return;
      }

      if (!map.getSource(source)) {
        console.log('Source not found, retrying...');
        setTimeout(addLayers, 100);
        return;
      }

      // Add unclustered point layer
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

    // Initial attempt to add layers
    addLayers();

    // Set up style.load event listener if style isn't loaded
    if (!map.isStyleLoaded()) {
      map.once('style.load', addLayers);
    }

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