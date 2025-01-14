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

    // If style is not loaded, wait for it
    if (!map.isStyleLoaded()) {
      map.once('style.load', () => {
        addLayers();
      });
    } else {
      addLayers();
    }

    return () => {
      if (map.getLayer('clusters')) map.removeLayer('clusters');
      if (map.getLayer('cluster-count')) map.removeLayer('cluster-count');
    };
  }, [map, source]);

  return null;
};

export default ClusterLayers;