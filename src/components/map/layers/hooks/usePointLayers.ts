
import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Venue } from '@/types/venue';

interface UsePointLayersProps {
  map: mapboxgl.Map;
  source: string;
  visitedVenueIds: string[];
  onVenueSelect?: (venue: Venue) => void;
  isSourceReady: boolean;
}

export const usePointLayers = ({ 
  map, 
  source, 
  visitedVenueIds, 
  onVenueSelect,
  isSourceReady 
}: UsePointLayersProps) => {
  const layersAdded = useRef(false);
  const visitedIdsRef = useRef<string[]>([]);

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
            '#22c55e',
            '#fbbf24'
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

      layersAdded.current = true;
      console.log('Point layers added successfully with', visitedVenueIds.length, 'visited venues');
      visitedIdsRef.current = [...visitedVenueIds];
    } catch (error) {
      console.error('Error adding point layers:', error);
      layersAdded.current = false;
    }
  }, [map, source, isSourceReady, visitedVenueIds]);

  return {
    layersAdded: layersAdded.current,
    updatePointColors,
    addPointLayers
  };
};
