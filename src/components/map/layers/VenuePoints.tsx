
import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapSource } from './MapSource';
import { usePointLayers } from './hooks/usePointLayers';
import { useMapEvents } from './hooks/useMapEvents';
import type { Venue } from '@/types/venue';

interface VenuePointsProps {
  map: mapboxgl.Map;
  source: string;
  visitedVenueIds?: string[];
  onVenueSelect?: (venue: Venue) => void;
}

const VenuePoints = ({ 
  map, 
  source, 
  visitedVenueIds = [], 
  onVenueSelect 
}: VenuePointsProps) => {
  const { isSourceReady } = useMapSource();
  
  const { 
    updatePointColors, 
    addPointLayers 
  } = usePointLayers({ 
    map, 
    source, 
    visitedVenueIds, 
    onVenueSelect,
    isSourceReady 
  });

  useMapEvents({ map, onVenueSelect });

  // Initial layer setup
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
      } catch (error) {
        console.warn('Error cleaning up point layers:', error);
      }
    };
  }, [map, source, isSourceReady, addPointLayers]);

  // Update colors when visited venues change
  useEffect(() => {
    if (map.getLayer('unclustered-point')) {
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
        setTimeout(addPointLayers, 100);
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
