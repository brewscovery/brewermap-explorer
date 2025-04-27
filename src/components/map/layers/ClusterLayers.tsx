
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapSource } from './MapSource';

interface ClusterLayersProps {
  map: mapboxgl.Map;
  source: string;
}

const ClusterLayers = ({ map, source }: ClusterLayersProps) => {
  const { isSourceReady } = useMapSource();
  const layersAdded = useRef(false);

  useEffect(() => {
    // Only proceed when source is ready
    if (!isSourceReady) {
      console.log('Waiting for source to be ready before adding cluster layers');
      return;
    }

    const addLayers = () => {
      if (!map.isStyleLoaded() || layersAdded.current) return;

      try {
        console.log('Adding cluster layers now that source is ready');
        
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

        layersAdded.current = true;
        console.log('Cluster layers added successfully');
      } catch (error) {
        console.error('Error adding cluster layers:', error);
        layersAdded.current = false;
      }
    };

    // Add layers when source is ready and style is loaded
    if (map.isStyleLoaded()) {
      console.log('Map style is loaded, attempting to add cluster layers');
      addLayers();
    } else {
      console.log('Map style not loaded, setting up style.load listener for cluster layers');
      const styleHandler = () => {
        console.log('Style loaded event for cluster layers');
        addLayers();
      };
      map.on('style.load', styleHandler);
      return () => {
        map.off('style.load', styleHandler);
      };
    }

    // Cleanup function
    return () => {
      if (!map.getStyle()) return;
      
      try {
        ['cluster-count', 'clusters'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
        layersAdded.current = false;
        console.log('Cluster layers removed on cleanup');
      } catch (error) {
        console.warn('Error cleaning up cluster layers:', error);
      }
    };
  }, [map, source, isSourceReady]);

  // Also handle style changes which might require re-adding the layers
  useEffect(() => {
    const handleStyleData = () => {
      if (isSourceReady && !map.getLayer('clusters') && !layersAdded.current) {
        console.log('Style changed, re-adding cluster layers');
        layersAdded.current = false;
      }
    };

    map.on('styledata', handleStyleData);
    
    return () => {
      map.off('styledata', handleStyleData);
    };
  }, [map, isSourceReady]);

  return null;
};

export default ClusterLayers;
