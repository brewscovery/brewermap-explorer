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
  
  const eventHandlers = useRef<{
    click?: (e: mapboxgl.MapLayerMouseEvent) => void;
    mouseEnter?: () => void;
    mouseLeave?: () => void;
  }>({});

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

      visitedIdsRef.current = [...visitedVenueIds];
    } catch (error) {
      console.error('Error updating point colors:', error);
    }
  }, [map, visitedVenueIds]);

  const addPointLayers = useCallback(() => {
    if (!isSourceReady || layersAdded.current || !map.getSource(source)) {
      return;
    }
    
    try {
      console.log('Adding point layers now that source is ready');
      
      ['unclustered-point', 'unclustered-point-label'].forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      });

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

      if (onVenueSelect) {
        eventHandlers.current.click = (e: mapboxgl.MapLayerMouseEvent) => {
          if (e.features && e.features[0]) {
            const props = e.features[0].properties;
            if (props) {
              console.log('Point clicked:', props);
              // TODO: Implement venue selection logic
            }
          }
        };
        
        eventHandlers.current.mouseEnter = () => {
          map.getCanvas().style.cursor = 'pointer';
        };
        
        eventHandlers.current.mouseLeave = () => {
          map.getCanvas().style.cursor = '';
        };

        if (eventHandlers.current.click) {
          map.on('click', 'unclustered-point', eventHandlers.current.click);
        }
        if (eventHandlers.current.mouseEnter) {
          map.on('mouseenter', 'unclustered-point', eventHandlers.current.mouseEnter);
        }
        if (eventHandlers.current.mouseLeave) {
          map.on('mouseleave', 'unclustered-point', eventHandlers.current.mouseLeave);
        }
      }

      layersAdded.current = true;
      console.log('Point layers added successfully with', visitedVenueIds.length, 'visited venues');
      visitedIdsRef.current = [...visitedVenueIds];
    } catch (error) {
      console.error('Error adding point layers:', error);
      layersAdded.current = false;
    }
  }, [map, source, isSourceReady, visitedVenueIds, onVenueSelect]);

  useEffect(() => {
    if (!isSourceReady) {
      console.log('Waiting for source to be ready before adding point layers');
      return;
    }

    console.log('Adding point layers for the first time');
    addPointLayers();

    return () => {
      if (!map.getStyle()) return;
      
      try {
        ['unclustered-point', 'unclustered-point-label'].forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
        });
        
        if (onVenueSelect) {
          if (eventHandlers.current.click) {
            map.off('click', 'unclustered-point', eventHandlers.current.click);
          }
          if (eventHandlers.current.mouseEnter) {
            map.off('mouseenter', 'unclustered-point', eventHandlers.current.mouseEnter);
          }
          if (eventHandlers.current.mouseLeave) {
            map.off('mouseleave', 'unclustered-point', eventHandlers.current.mouseLeave);
          }
        }
        
        layersAdded.current = false;
        console.log('Point layers removed on cleanup');
      } catch (error) {
        console.warn('Error cleaning up point layers:', error);
      }
    };
  }, [map, source, isSourceReady, addPointLayers, onVenueSelect]);

  useEffect(() => {
    const idsChanged = JSON.stringify(visitedIdsRef.current) !== JSON.stringify(visitedVenueIds);
    
    if (layersAdded.current && idsChanged && map.getLayer('unclustered-point')) {
      console.log('Detected change in visited venues, updating colors');
      updatePointColors();
    }
  }, [map, visitedVenueIds, updatePointColors]);

  useEffect(() => {
    const handleStyleChange = () => {
      if (!isSourceReady) return;
      
      if (!map.getLayer('unclustered-point') && map.getSource(source)) {
        console.log('Style changed, need to re-add point layers');
        layersAdded.current = false;
        
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
