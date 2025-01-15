import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface ClusterLayersProps {
  map: mapboxgl.Map;
  source: string;
}

const ClusterLayers = ({ map, source }: ClusterLayersProps) => {
  useEffect(() => {
    const addLayers = () => {
      // Add clusters layer
      if (!map.getLayer('clusters')) {
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51A4DB',
              10,
              '#2B8CBE',
              30,
              '#084081'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              10,
              30,
              30,
              40
            ]
          }
        });
      }

      // Add cluster count layer
      if (!map.getLayer('cluster-count')) {
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source,
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          },
          paint: {
            'text-color': '#ffffff'
          }
        });
      }
    };

    const initializeLayers = () => {
      if (map.getSource(source)) {
        addLayers();
      } else {
        const checkSource = setInterval(() => {
          if (map.getSource(source)) {
            addLayers();
            clearInterval(checkSource);
          }
        }, 100);

        setTimeout(() => clearInterval(checkSource), 5000);
      }
    };

    if (map.loaded()) {
      initializeLayers();
    } else {
      map.once('load', initializeLayers);
    }

    return () => {
      // Only try to remove layers if the map still exists and is loaded
      if (map && !map.isStyleLoaded()) return;
      
      try {
        if (map.getLayer('clusters')) {
          map.removeLayer('clusters');
        }
        if (map.getLayer('cluster-count')) {
          map.removeLayer('cluster-count');
        }
      } catch (error) {
        console.warn('Error cleaning up cluster layers:', error);
      }
    };
  }, [map, source]);

  return null;
};

export default ClusterLayers;