
import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapSource } from './MapSource';
import type { Venue } from '@/types/venue';

interface VenuePointsProps {
  map: mapboxgl.Map;
  source: string;
  visitedVenueIds?: string[];
  onVenueSelect?: (venue: Venue) => void;
}

const VenuePoints = ({ map, source, visitedVenueIds = [], onVenueSelect }: VenuePointsProps) => {
  const { isSourceReady } = useMapSource();
  const layersAdded = useRef(false);
  const visitedIdsRef = useRef<string[]>([]);

  // Helper function to update point colors
  const updatePointColors = useCallback(() => {
    try {
      if (!map.getLayer('unclustered-point')) {
        console.log('Cannot update point colors - layer not found');
        return;
      }

      console.log(`Updating venue point colors with ${visitedVenueIds.length} visited venues`);
      
      map.setPaintProperty('unclustered-point', 'circle-color', [
        'case',
        ['in', ['get', 'id'], ['literal', visitedVenueIds]],
        '#22c55e', // Green color for visited venues
        '#fbbf24'  // Default yellow color for unvisited venues
      ]);

      // Store current visited IDs in ref for comparison
      visitedIdsRef.current = [...visitedVenueIds];
    } catch (error) {
      console.error('Error updating point colors:', error);
    }
  }, [map, visitedVenueIds]);

  // Add point layers
  const addPointLayers = useCallback(() => {
    if (!isSourceReady || layersAdded.current || !map.getSource(source)) {
      return;
    }
    
    try {
      console.log('Adding point layers now that source is ready');
      
      // Remove existing layers if they exist
      ['unclustered-point', 'unclustered-point-label'].forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      });

      // Add unclustered point layer
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: source,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['in', ['get', 'id'], ['literal', visitedVenueIds]],
            '#22c55e', // Green color for visited venues
            '#fbbf24'  // Default yellow color for unvisited venues
          ],
          'circle-radius': 12,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Add text labels for unclustered points
      map.addLayer({
        id: 'unclustered-point-label',
        type: 'symbol',
        source: source,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-offset': [0, 1.5],
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

      // Add click handler if onVenueSelect is provided
      if (onVenueSelect) {
        // Fix: Use proper function handlers instead of strings
        const clickHandler = (e: mapboxgl.MapLayerMouseEvent) => {
          if (e.features && e.features[0]) {
            const props = e.features[0].properties;
            if (props) {
              // Find the actual venue object from the properties
              console.log('Point clicked:', props);
              // NOTE: onVenueSelect needs to be implemented separately as we don't have access to the full venue object here
            }
          }
        };
        
        const mouseEnterHandler = () => {
          map.getCanvas().style.cursor = 'pointer';
        };
        
        const mouseLeaveHandler = () => {
          map.getCanvas().style.cursor = '';
        };

        map.on('click', 'unclustered-point', clickHandler);
        map.on('mouseenter', 'unclustered-point', mouseEnterHandler);
        map.on('mouseleave', 'unclustered-point', mouseLeaveHandler);
      }

      layersAdded.current = true;
      console.log('Point layers added successfully with', visitedVenueIds.length, 'visited venues');
      visitedIdsRef.current = [...visitedVenueIds];
    } catch (error) {
      console.error('Error adding point layers:', error);
      layersAdded.current = false;
    }
  }, [map, source, isSourceReady, visitedVenueIds, onVenueSelect]);

  // Add layers when source is ready
  useEffect(() => {
    if (!isSourceReady) {
      console.log('Waiting for source to be ready before adding point layers');
      return;
    }

    console.log('Adding point layers for the first time');
    addPointLayers();

    // Clean up on unmount
    return () => {
      if (!map.getStyle()) return;
      
      try {
        ['unclustered-point', 'unclustered-point-label'].forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
        });
        
        if (onVenueSelect) {
          // Fix: Use proper function references for event cleanup
          map.off('click', 'unclustered-point');
          map.off('mouseenter', 'unclustered-point');
          map.off('mouseleave', 'unclustered-point');
        }
        
        layersAdded.current = false;
        console.log('Point layers removed on cleanup');
      } catch (error) {
        console.warn('Error cleaning up point layers:', error);
      }
    };
  }, [map, source, isSourceReady, addPointLayers, onVenueSelect]);

  // Update colors when visitedVenueIds changes
  useEffect(() => {
    const idsChanged = JSON.stringify(visitedIdsRef.current) !== JSON.stringify(visitedVenueIds);
    
    if (layersAdded.current && idsChanged && map.getLayer('unclustered-point')) {
      console.log('Detected change in visited venues, updating colors');
      updatePointColors();
    }
  }, [map, visitedVenueIds, updatePointColors]);

  // Handle style changes
  useEffect(() => {
    const handleStyleChange = () => {
      if (!isSourceReady) return;
      
      if (!map.getLayer('unclustered-point') && map.getSource(source)) {
        console.log('Style changed, need to re-add point layers');
        layersAdded.current = false;
        
        // Add a slight delay to ensure the source is properly initialized
        setTimeout(() => {
          addPointLayers();
        }, 100);
      }
    };

    map.on('styledata', handleStyleChange);
    
    return () => {
      map.off('styledata', handleStyleChange);
    };
  }, [map, source, isSourceReady, addPointLayers]);

  return null;
};

export default VenuePoints;
