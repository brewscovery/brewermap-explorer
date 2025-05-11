
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Venue } from '@/types/venue';

interface UseMapEventsProps {
  map: mapboxgl.Map;
  onVenueSelect?: (venue: Venue) => void;
}

export const useMapEvents = ({ map, onVenueSelect }: UseMapEventsProps) => {
  const eventHandlers = useRef<{
    click: ((e: mapboxgl.MapLayerMouseEvent) => void) | null;
    mouseEnter: (() => void) | null;
    mouseLeave: (() => void) | null;
  }>({
    click: null,
    mouseEnter: null,
    mouseLeave: null
  });
  
  // We're not going to add click handlers here anymore, as they're already handled
  // in MapInteractions.tsx, which would cause duplicate events
  // Instead we'll just handle mouse cursor effects
  
  useEffect(() => {
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    eventHandlers.current = {
      click: null, // No click handlers here anymore
      mouseEnter: handleMouseEnter,
      mouseLeave: handleMouseLeave
    };

    // Only add mouse enter/leave events, not click events
    map.on('mouseenter', 'unclustered-point', handleMouseEnter);
    map.on('mouseleave', 'unclustered-point', handleMouseLeave);

    return () => {
      if (eventHandlers.current.mouseEnter) {
        map.off('mouseenter', 'unclustered-point', eventHandlers.current.mouseEnter);
      }
      if (eventHandlers.current.mouseLeave) {
        map.off('mouseleave', 'unclustered-point', eventHandlers.current.mouseLeave);
      }
    };
  }, [map]);

  return eventHandlers.current;
};
