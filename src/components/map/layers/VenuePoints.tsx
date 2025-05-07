
import { useEffect, useRef } from 'react';
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
  const layersAddedRef = useRef(false);
  
  const { 
    updatePointColors, 
    addPointLayers,
  } = usePointLayers({ 
    map, 
    source, 
    visitedVenueIds, 
    onVenueSelect,
    isSourceReady 
  });

  useMapEvents({ map, onVenueSelect });

  // Initial layer setup - only adds layers if they don't exist
  useEffect(() => {
    if (!isSourceReady || !map.getStyle()) return;

    // Reset layers added flag when source changes
    if (!layersAddedRef.current) {
      const timer = setTimeout(() => {
        // Only try to add point layers if the source exists
        if (map.getSource(source)) {
          const success = addPointLayers();
          layersAddedRef.current = success;
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [map, source, isSourceReady, addPointLayers]);

  // Update colors whenever visited venues change
  useEffect(() => {
    if (isSourceReady && map.getLayer('unclustered-point')) {
      updatePointColors();
    }
  }, [map, visitedVenueIds, updatePointColors, isSourceReady]);

  // Reset when source changes
  useEffect(() => {
    return () => {
      layersAddedRef.current = false;
    };
  }, [source]);

  return null;
};

export default VenuePoints;
