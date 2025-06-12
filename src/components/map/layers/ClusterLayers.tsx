
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
  const attemptCount = useRef(0);
  const maxAttempts = 3;

  // Safely remove cluster layers with proper style checks
  const removeClusterLayers = useCallback(() => {
    // Check if map exists and style is loaded before accessing
    if (!map || !map.isStyleLoaded() || !map.getStyle) {
      return;
    }
    
    try {
      // Additional check to ensure style is actually available
      const style = map.getStyle();
      if (!style) return;
      
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
  const addClusterLayers = useCallback(() => {
    if (!isSourceReady) {
      console.log('Source not ready yet for cluster layers');
      return false;
    }

    // Check if map and style are ready
    if (!map || !map.isStyleLoaded()) {
      console.log('Map or style not ready for cluster layers');
      return false;
    }

    try {
      // Check if source exists
      if (!map.getSource(source)) {
        console.log('Source not available for cluster layers');
        return false;
      }

      // Check if layers already exist
      if (map.getLayer('clusters') && map.getLayer('cluster-count')) {
        console.log('Cluster layers already exist');
        layersAdded.current = true;
        return true;
      }

      // Remove any existing layers first
      removeClusterLayers();
      
      console.log('Adding cluster layers to map...');

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
      return true;
    } catch (error) {
      console.error('Error adding cluster layers:', error);
      layersAdded.current = false;
      return false;
    }
  }, [map, source, isSourceReady, removeClusterLayers]);

  // Handle source changes and retries
  useEffect(() => {
    const handleStyleChange = () => {
      // If layers were previously added but now missing, try to add them again
      if (layersAdded.current && map.isStyleLoaded() && !map.getLayer('clusters')) {
        console.log('Detected missing cluster layers after style change, attempting to re-add');
        layersAdded.current = false;
        
        // Short delay to ensure style is stable
        setTimeout(() => {
          addClusterLayers();
        }, 200);
      }
    };

    // Add style change listener
    map.on('styledata', handleStyleChange);
    
    const attemptLayerAddition = () => {
      if (attemptCount.current < maxAttempts) {
        attemptCount.current += 1;
        console.log(`Attempt ${attemptCount.current}/${maxAttempts} to add cluster layers`);
        
        const success = addClusterLayers();
        
        if (!success && attemptCount.current < maxAttempts) {
          // Try again with increasing delay
          setTimeout(attemptLayerAddition, 300 * attemptCount.current);
        }
      }
    };

    // Initial attempt to add layers
    if (map.isStyleLoaded() && isSourceReady) {
      attemptLayerAddition();
    } else {
      // Wait for style and source to be ready
      const checkReadiness = setInterval(() => {
        if (map.isStyleLoaded() && isSourceReady) {
          clearInterval(checkReadiness);
          attemptLayerAddition();
        }
      }, 200);

      // Clear interval after 5 seconds to prevent infinite checks
      setTimeout(() => clearInterval(checkReadiness), 5000);
    }

    return () => {
      map.off('styledata', handleStyleChange);
      
      // Safe cleanup with style checks
      if (map && map.isStyleLoaded()) {
        try {
          removeClusterLayers();
        } catch (error) {
          console.warn('Error during cleanup:', error);
        }
      }
    };
  }, [map, addClusterLayers, removeClusterLayers, isSourceReady]);
  
  return null;
};

export default ClusterLayers;
