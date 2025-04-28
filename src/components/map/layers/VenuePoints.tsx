
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
  const styleLoadHandlerRef = useRef<() => void | null>(null);
  
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
            console.log(`Removed layer ${layerId} during cleanup`);
          }
        });
      } catch (error) {
        console.warn('Error cleaning up point layers:', error);
      }
    };
  }, [map, source, isSourceReady, addPointLayers]);

  // Update colors when visited venues change
  useEffect(() => {
    if (isSourceReady && map.getLayer('unclustered-point')) {
      console.log(`Updating venue colors with ${visitedVenueIds.length} visited venues`);
      updatePointColors();
    }
  }, [map, visitedVenueIds, updatePointColors, isSourceReady]);

  // Enhanced style change handler with retry mechanism
  useEffect(() => {
    // Remove any existing style change handler
    if (styleLoadHandlerRef.current) {
      map.off('styledata', styleLoadHandlerRef.current);
      styleLoadHandlerRef.current = null;
    }

    // Create new handler
    const handleStyleChange = () => {
      console.log('Style changed event detected');
      
      // If source isn't ready, we can't add layers yet
      if (!isSourceReady) {
        console.log('Source not ready during style change, will wait');
        return;
      }
      
      // Check if point layer exists
      const needsLayers = !map.getLayer('unclustered-point');
      
      // Check if source exists
      const hasSource = map.getSource(source) ? true : false;
      
      if (needsLayers && hasSource) {
        console.log('Style changed, need to re-add point layers');
        
        // Progressive retry mechanism with increasing delays
        const attemptAddLayers = (attempts = 0) => {
          setTimeout(() => {
            try {
              if (!map.getLayer('unclustered-point') && map.getSource(source)) {
                console.log(`Attempt ${attempts + 1} to re-add point layers after style change`);
                addPointLayers();
                
                // Verify layer was actually added
                if (!map.getLayer('unclustered-point')) {
                  if (attempts < 3) {
                    console.log(`Layer still not added, retrying... (attempt ${attempts + 1})`);
                    attemptAddLayers(attempts + 1);
                  } else {
                    console.warn('Failed to add layers after multiple attempts');
                  }
                } else {
                  console.log('Successfully re-added point layers after style change');
                  updatePointColors();
                }
              }
            } catch (error) {
              console.error('Error re-adding layers:', error);
              if (attempts < 3) {
                attemptAddLayers(attempts + 1);
              }
            }
          }, 100 * Math.pow(2, attempts)); // Exponential backoff: 100ms, 200ms, 400ms
        };
        
        attemptAddLayers();
      }
    };
    
    // Store reference to the handler
    styleLoadHandlerRef.current = handleStyleChange;
    map.on('styledata', handleStyleChange);
    
    return () => {
      if (styleLoadHandlerRef.current) {
        map.off('styledata', styleLoadHandlerRef.current);
      }
    };
  }, [map, source, isSourceReady, addPointLayers, updatePointColors]);

  return null;
};

export default VenuePoints;
