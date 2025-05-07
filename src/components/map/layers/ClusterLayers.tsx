
import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapSource } from './MapSource';

interface ClusterLayersProps {
  map: mapboxgl.Map;
  source: string;
}

const ClusterLayers = ({ map, source }: ClusterLayersProps) => {
  const { isSourceReady } = useMapSource();
  const layersAdded = useRef(false);

  // Safely remove cluster layers
  const removeClusterLayers = useCallback(() => {
    if (!map.getStyle()) return;
    
    try {
      const layers = ['cluster-count', 'clusters'];
      
      layers.forEach(layer => {
        if (map.getLayer(layer)) {
          map.removeLayer(layer);
          console.log(`Removed cluster layer: ${layer}`);
        }
      });
      
      layersAdded.current = false;
    } catch (error) {
      console.warn('Error removing cluster layers:', error);
    }
  }, [map]);

  // Add layers when source is ready
  useEffect(() => {
    if (!isSourceReady) {
      console.log('Waiting for source to be ready before adding cluster layers');
      return;
    }

    console.log('Source is ready, attempting to add cluster layers');
    
    const addLayers = () => {
      try {
        // First remove any existing layers
        removeClusterLayers();
        
        // Check if source exists
        if (!map.getSource(source)) {
          console.log('Source not available for cluster layers');
          return;
        }

        // Add clusters layer
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: source,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#fbbf24',
              10,
              '#f59e0b',
              50,
              '#d97706'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              10,
              30,
              50,
              40
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Add cluster count layer
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

        console.log('Cluster layers added successfully');
        layersAdded.current = true;
      } catch (error) {
        console.error('Error adding cluster layers:', error);
        layersAdded.current = false;
      }
    };

    // Short delay to ensure source is fully ready
    const timer = setTimeout(() => {
      if (map.isStyleLoaded() && map.getSource(source)) {
        console.log('Map style is loaded, adding cluster layers');
        addLayers();
      }
    }, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, [map, source, isSourceReady, removeClusterLayers]);
  
  // Handle source changes
  useEffect(() => {
    return () => {
      removeClusterLayers();
      layersAdded.current = false;
    };
  }, [source, removeClusterLayers]);
  
  return null;
};

export default ClusterLayers;
