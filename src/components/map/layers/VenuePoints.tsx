
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
  const lastVisitedVenuesRef = useRef<string>('');
  
  const { 
    updatePointColors, 
    addPointLayers,
    removeLayers
  } = usePointLayers({ 
    map, 
    source, 
    visitedVenueIds, 
    onVenueSelect,
    isSourceReady 
  });

  // Set up event handlers for map interactions
  useMapEvents({ map, onVenueSelect });

  // Initial layer setup - only adds layers if they don't exist
  useEffect(() => {
    if (!isSourceReady || !map.getStyle()) return;

    const timer = setTimeout(() => {
      // First ensure we have a clean state
      if (!layersAddedRef.current) {
        // Only try to add point layers if the source exists
        if (map.getSource(source)) {
          console.log('Source exists, adding point layers');
          const success = addPointLayers();
          layersAddedRef.current = success;
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [map, source, isSourceReady, addPointLayers]);

  // Update colors whenever visited venues change, but only if they actually changed
  useEffect(() => {
    const currentVisitedVenues = JSON.stringify(visitedVenueIds.sort());
    
    if (isSourceReady && map.getLayer('unclustered-point') && 
        currentVisitedVenues !== lastVisitedVenuesRef.current) {
      
      console.log('Updating venue point colors with', visitedVenueIds.length, 'visited venues');
      updatePointColors();
      lastVisitedVenuesRef.current = currentVisitedVenues;
    }
  }, [map, visitedVenueIds, updatePointColors, isSourceReady]);

  // Reset when source changes
  useEffect(() => {
    return () => {
      layersAddedRef.current = false;
      lastVisitedVenuesRef.current = '';
    };
  }, [source]);

  return null;
};

export default VenuePoints;
