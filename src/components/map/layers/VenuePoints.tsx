
import { useEffect, useRef, useState } from 'react';
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
  const styleLoadHandlerRef = useRef<(() => void) | null>(null);
  const [styleChangeCount, setStyleChangeCount] = useState(0);
  
  const { 
    updatePointColors, 
    addPointLayers,
    addLayerAttempts
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

    if (!map.getStyle()) {
      console.log('Map style not ready, delaying layer addition');
      return;
    }

    // Add a brief delay to ensure map is fully ready
    const timer = setTimeout(() => {
      console.log('Adding point layers for the first time');
      addPointLayers();
    }, 200);

    return () => {
      clearTimeout(timer);
      
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

  // Enhanced style change handler with multiple safeguards
  useEffect(() => {
    // Remove any existing style change handler
    if (styleLoadHandlerRef.current) {
      map.off('styledata', styleLoadHandlerRef.current);
      styleLoadHandlerRef.current = null;
    }

    // Create new handler with debouncing to avoid multiple rapid style changes
    let styleChangeTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const handleStyleChange = () => {
      console.log('Style changed event detected');
      setStyleChangeCount(prev => prev + 1);
      
      // Clear any pending timeouts to prevent multiple handlers
      if (styleChangeTimeout) {
        clearTimeout(styleChangeTimeout);
      }
      
      // Debounce style change handling to ensure we only process the final event
      styleChangeTimeout = setTimeout(() => {
        // If source isn't ready, we can't add layers yet
        if (!isSourceReady) {
          console.log('Source not ready during style change, will wait');
          return;
        }
        
        // Verify map is ready
        if (!map.getStyle()) {
          console.log('Map style not available, cannot add layers');
          return;
        }
        
        // Check if point layer exists
        const needsLayers = !map.getLayer('unclustered-point');
        
        // Check if source exists
        let hasSource = false;
        try {
          hasSource = map.getSource(source) ? true : false;
        } catch (e) {
          console.log('Error checking source:', e);
          hasSource = false;
        }
        
        if (needsLayers && hasSource) {
          console.log('Style changed, need to re-add point layers');
          
          // Use a more generous delay before first attempt after style change
          setTimeout(() => {
            const success = addPointLayers();
            
            if (success) {
              console.log('Successfully added layers after style change');
              updatePointColors();
            } else {
              console.log('Initial layer addition failed, will retry with progressive delays');
              
              // Progressive retry mechanism with increasing delays
              const attemptAddLayers = (attempts = 0) => {
                if (attempts >= 5) {
                  console.warn('Failed to add layers after multiple attempts');
                  return;
                }
                
                setTimeout(() => {
                  // Check again if layers are still needed
                  if (!map.getLayer('unclustered-point')) {
                    console.log(`Retry attempt ${attempts + 1} to add point layers`);
                    const success = addPointLayers();
                    
                    if (!success && attempts < 4) {
                      attemptAddLayers(attempts + 1);
                    } else if (success) {
                      console.log('Successfully re-added point layers after retry');
                      updatePointColors();
                    }
                  }
                }, 500 * Math.pow(2, attempts)); // More generous backoff: 500ms, 1000ms, 2000ms, etc.
              };
              
              attemptAddLayers();
            }
          }, 300);
        }
      }, 200); // Debounce style changes that occur within 200ms
    };
    
    // Store reference to the handler
    styleLoadHandlerRef.current = handleStyleChange;
    map.on('styledata', handleStyleChange);
    
    return () => {
      if (styleLoadHandlerRef.current) {
        map.off('styledata', styleLoadHandlerRef.current);
      }
      if (styleChangeTimeout) {
        clearTimeout(styleChangeTimeout);
      }
    };
  }, [map, source, isSourceReady, addPointLayers, updatePointColors]);

  // Force layer re-addition if style has changed multiple times but layers still missing
  useEffect(() => {
    if (styleChangeCount > 2 && isSourceReady && !map.getLayer('unclustered-point')) {
      console.log('Multiple style changes detected but layers still missing - forcing layer addition');
      const timer = setTimeout(() => {
        addPointLayers();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [styleChangeCount, map, isSourceReady, addPointLayers]);

  return null;
};

export default VenuePoints;
