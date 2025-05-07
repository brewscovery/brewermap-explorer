
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

  // Update point colors without removing/re-adding layers
  const updatePointColors = useCallback(() => {
    if (!map.getLayer('unclustered-point')) return;

    try {
      console.log(`Updating venue point colors with ${visitedVenueIds.length} visited venues`);
      
      if (map && map.getStyle()) {
        map.setPaintProperty('unclustered-point', 'circle-color', [
          'case',
          ['in', ['get', 'id'], ['literal', visitedVenueIds]],
          '#22c55e', // Green color for visited venues
          '#fbbf24'  // Default yellow color for unvisited venues
        ]);
      }
    } catch (error) {
      console.warn('Error updating point colors:', error);
    }
  }, [map, visitedVenueIds]);

  // Safely remove layers
  const removeLayers = useCallback(() => {
    if (!map.getStyle()) return;
    
    try {
      // Remove layers in proper order
      const layers = ['unclustered-point-label', 'unclustered-point'];
      
      layers.forEach(layer => {
        if (map.getLayer(layer)) {
          map.removeLayer(layer);
          console.log(`Removed layer: ${layer}`);
        }
      });
      
      layersAdded.current = false;
    } catch (error) {
      console.warn('Error removing point layers:', error);
    }
  }, [map]);

  // Add layers only once when source is ready
  const addPointLayers = useCallback(() => {
    if (!isSourceReady) return false;

    try {
      if (!map || !map.getStyle()) return false;
      
      // Verify source exists before proceeding
      if (!map.getSource(source)) {
        console.log('Source not available, cannot add point layers');
        return false;
      }
      
      // Check if layers already exist
      if (map.getLayer('unclustered-point')) {
        console.log('Point layers already exist');
        updatePointColors();
        layersAdded.current = true;
        return true;
      }
      
      // Add the point layer if it doesn't exist
      console.log('Adding point layers');
      
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
      console.log('Point layers added successfully');
      return true;
    } catch (error) {
      console.error('Error adding point layers:', error);
      layersAdded.current = false;
      return false;
    }
  }, [map, source, isSourceReady, visitedVenueIds, updatePointColors]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      layersAdded.current = false;
    };
  }, [source]);

  return {
    layersAdded: layersAdded.current,
    updatePointColors,
    addPointLayers,
    removeLayers
  };
};
