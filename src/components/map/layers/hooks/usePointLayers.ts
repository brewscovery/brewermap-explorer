
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
  const addLayerAttemptsRef = useRef(0);

  // Reset the attempts counter when the map or source changes
  useEffect(() => {
    addLayerAttemptsRef.current = 0;
    layersAdded.current = false;
  }, [map, source]);

  const updatePointColors = useCallback(() => {
    try {
      if (!map.getLayer('unclustered-point')) {
        console.log('Cannot update point colors - layer not found');
        return;
      }

      console.log(`Updating venue point colors with ${visitedVenueIds.length} visited venues`);
      
      // Ensure we're operating on the correct and current map instance
      if (map && map.getStyle()) {
        map.setPaintProperty('unclustered-point', 'circle-color', [
          'case',
          ['in', ['get', 'id'], ['literal', visitedVenueIds]],
          '#22c55e', // Green color for visited venues
          '#fbbf24'  // Default yellow color for unvisited venues
        ]);
        
        visitedIdsRef.current = [...visitedVenueIds];
        console.log('Point colors updated successfully');
      }
    } catch (error) {
      console.error('Error updating point colors:', error);
    }
  }, [map, visitedVenueIds]);

  const addPointLayers = useCallback(() => {
    // Only proceed if we haven't exceeded max attempts (5), the source is ready, and layers aren't already added
    if (addLayerAttemptsRef.current >= 5 || !isSourceReady || layersAdded.current) {
      if (addLayerAttemptsRef.current >= 5) {
        console.warn('Maximum layer addition attempts reached');
      }
      return false;
    }

    addLayerAttemptsRef.current++;
    console.log(`Attempt ${addLayerAttemptsRef.current} to add point layers`);

    try {
      // Ensure we have a valid map and style
      if (!map || !map.getStyle()) {
        console.log('Map or style not ready, delaying layer addition');
        return false;
      }
      
      // Verify source exists before proceeding
      const sourceExists = map.getSource(source) ? true : false;
      if (!sourceExists) {
        console.log('Source not found, cannot add layers');
        return false;
      }
      
      // Remove existing layers if they exist to avoid duplicates
      ['unclustered-point', 'unclustered-point-label'].forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
          console.log(`Removed existing layer ${layerId} before re-adding`);
        }
      });

      // Add the point layer
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

      // Add the label layer
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
      return true;
    } catch (error) {
      console.error('Error adding point layers:', error);
      layersAdded.current = false;
      return false;
    }
  }, [map, source, isSourceReady, visitedVenueIds]);

  return {
    layersAdded: layersAdded.current,
    updatePointColors,
    addPointLayers,
    addLayerAttempts: addLayerAttemptsRef.current
  };
};
