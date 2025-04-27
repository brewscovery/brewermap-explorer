
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

  useEffect(() => {
    if (!onVenueSelect) return;

    const handleClick = (e: mapboxgl.MapLayerMouseEvent) => {
      if (e.features?.[0]) {
        const props = e.features[0].properties;
        if (props) {
          console.log('Point clicked:', props);
          // TODO: Implement venue selection logic
        }
      }
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    eventHandlers.current = {
      click: handleClick,
      mouseEnter: handleMouseEnter,
      mouseLeave: handleMouseLeave
    };

    map.on('click', 'unclustered-point', handleClick);
    map.on('mouseenter', 'unclustered-point', handleMouseEnter);
    map.on('mouseleave', 'unclustered-point', handleMouseLeave);

    return () => {
      if (eventHandlers.current.click) {
        map.off('click', 'unclustered-point', eventHandlers.current.click);
      }
      if (eventHandlers.current.mouseEnter) {
        map.off('mouseenter', 'unclustered-point', eventHandlers.current.mouseEnter);
      }
      if (eventHandlers.current.mouseLeave) {
        map.off('mouseleave', 'unclustered-point', eventHandlers.current.mouseLeave);
      }
    };
  }, [map, onVenueSelect]);

  return eventHandlers.current;
};
