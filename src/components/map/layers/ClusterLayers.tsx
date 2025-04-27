
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

  // Add layers when source is ready
  useEffect(() => {
    if (!isSourceReady) {
      console.log('Waiting for source to be ready before adding cluster layers');
      return;
    }

    console.log('Source is ready, attempting to add cluster layers');
    
    const addLayers = () => {
      try {
        // Check if layers already exist
        if (map.getLayer('clusters') || layersAdded.current) {
          console.log('Cluster layers already exist, skipping addition');
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

    // Check if map style is loaded before adding layers
    if (map.isStyleLoaded()) {
      console.log('Map style is loaded, adding cluster layers');
      addLayers();
    } else {
      console.log('Map style not loaded, setting up style.load listener for cluster layers');
      
      const styleHandler = () => {
        console.log('Style loaded event fired for cluster layers');
        addLayers();
      };
      
      map.once('style.load', styleHandler);
      
      return () => {
        map.off('style.load', styleHandler);
      };
    }

    return () => {
      // No need to clean up here as we'll have a separate cleanup effect
    };
  }, [map, source, isSourceReady]);

  // Clean up layers on unmount or before re-adding
  useEffect(() => {
    return () => {
      if (!map.getStyle()) return;
      
      try {
        if (map.getLayer('cluster-count')) {
          map.removeLayer('cluster-count');
        }
        
        if (map.getLayer('clusters')) {
          map.removeLayer('clusters');
        }
        
        layersAdded.current = false;
        console.log('Cluster layers removed on cleanup');
      } catch (error) {
        console.warn('Error cleaning up cluster layers:', error);
      }
    };
  }, [map]);

  // Re-add layers when the style changes
  useEffect(() => {
    const handleStyleChange = () => {
      if (!isSourceReady) return;
      
      // Check if we need to re-add layers after a style change
      if (!map.getLayer('clusters') && !layersAdded.current) {
        console.log('Style changed, re-adding cluster layers');
        
        // We need to wait a bit to ensure the source is properly re-added
        setTimeout(() => {
          try {
            if (map.getSource(source) && !map.getLayer('clusters')) {
              layersAdded.current = false;
              
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
              
              layersAdded.current = true;
              console.log('Cluster layers re-added after style change');
            }
          } catch (error) {
            console.error('Error re-adding cluster layers after style change:', error);
          }
        }, 100); // Short delay to ensure source is ready
      }
    };

    map.on('styledata', handleStyleChange);
    
    return () => {
      map.off('styledata', handleStyleChange);
    };
  }, [map, source, isSourceReady]);

  return null;
};

export default ClusterLayers;
