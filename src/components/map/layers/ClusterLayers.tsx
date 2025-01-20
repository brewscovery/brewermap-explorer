import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface ClusterLayersProps {
  map: mapboxgl.Map;
  source: string;
}

const ClusterLayers = ({ map, source }: ClusterLayersProps) => {
  useEffect(() => {
    const addLayers = () => {
      if (!map.getSource(source)) {
        console.log('Source not found, retrying...');
        setTimeout(addLayers, 100);
        return;
      }

      // Add clusters layer
      if (!map.getLayer('clusters')) {
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: source,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#fbbf24', // Amber-400 for small clusters
              10,
              '#f59e0b', // Amber-500 for medium clusters
              30,
              '#d97706' // Amber-600 for large clusters
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              30, // Base size
              10, // If point count >= 10
              35, // Size if point count >= 10
              30, // If point count >= 30
              40  // Size if point count >= 30
            ],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 1
          }
        });
      }

      // Add cluster count layer
      if (!map.getLayer('cluster-count')) {
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: source,
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 14
          },
          paint: {
            'text-color': '#ffffff'
          }
        });
      }
    };

    // Wait for style to be loaded before adding layers
    if (!map.isStyleLoaded()) {
      map.once('style.load', addLayers);
    } else {
      addLayers();
    }

    return () => {
      if (!map.getStyle()) return;
      
      try {
        ['cluster-count', 'clusters'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
      } catch (error) {
        console.warn('Error cleaning up cluster layers:', error);
      }
    };
  }, [map, source]);

  return null;
};

export default ClusterLayers;