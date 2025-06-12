
import React, { useEffect, useCallback, useState, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Venue } from '@/types/venue';
import MapLayers from './map/layers/MapLayers';
import MapInteractions from './map/MapInteractions';
import MapGeolocation from './map/MapGeolocation';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useVisitedVenues } from '@/hooks/useVisitedVenues';
import { useVenueMapInteraction } from '@/hooks/useVenueMapInteraction';
import VenueSidebar from './venue/VenueSidebar';

interface MapProps {
  venues: Venue[];
  onVenueSelect: (venue: Venue | null) => void;
  selectedVenue?: Venue | null;
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  lastFilterUpdateTime?: number;
}

// Create a memo-wrapped MapLayers component to prevent unnecessary rerenders
const MemoizedMapLayers = memo(MapLayers, (prevProps, nextProps) => {
  // Only re-render if venues count changes, visited venues change, or key changes
  return (
    prevProps.venues.length === nextProps.venues.length &&
    JSON.stringify(prevProps.visitedVenueIds?.sort()) === JSON.stringify(nextProps.visitedVenueIds?.sort()) &&
    prevProps.key === nextProps.key
  );
});

const Map = ({ 
  venues, 
  onVenueSelect, 
  selectedVenue: selectedVenueFromProps,
  activeFilters = [],
  onFilterChange = () => {},
  lastFilterUpdateTime = 0
}: MapProps) => {
  const navigate = useNavigate();
  const { mapContainer, map, isStyleLoaded } = useMapInitialization();
  const { visitedVenueIds } = useVisitedVenues();
  
  // Use a state variable to track if selection happened internally
  const [isInternalSelection, setIsInternalSelection] = useState(false);
  
  // Create a stable key for MapLayers that only changes when filter COMPOSITION changes
  // not when venues selection changes
  const filtersKey = activeFilters.join('-');
  const mapLayersKey = useMemo(() => 
    `venues-${filtersKey}-${lastFilterUpdateTime}`, 
    [filtersKey, lastFilterUpdateTime]
  );
  
  const { 
    selectedVenue,
    handleVenueSelect,
    handleSidebarClose
  } = useVenueMapInteraction({ 
    map: map.current, 
    onVenueSelect: useCallback((venue) => {
      setIsInternalSelection(true);
      onVenueSelect(venue);
    }, [onVenueSelect]), 
    selectedVenueFromProps 
  });
  
  // Force map resize when venues array changes - but only if significant
  useEffect(() => {
    if (map.current && isStyleLoaded && venues.length > 0) {
      const timer = setTimeout(() => {
        if (map.current) {
          map.current.resize();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [map, isStyleLoaded, venues.length]);

  // Custom sidebar close handler to ensure it clears the venue and search
  const handleVenueSidebarClose = useCallback(() => {
    console.log("Map: Explicitly closing venue sidebar");
    handleSidebarClose();
    // Notify parent component to clear search bar and venue selection
    onVenueSelect(null);
    // Clear the venueId parameter from URL to allow notifications to work again
    navigate('/', { replace: true });
  }, [handleSidebarClose, onVenueSelect, navigate]);

  // Memoize the venue select handler to prevent recreating on every render
  const memoizedVenueSelect = useCallback((venue: Venue) => {
    handleVenueSelect(venue);
  }, [handleVenueSelect]);

  return (
    <div className="relative flex-1 w-full h-full">
      <div 
        ref={mapContainer} 
        className="absolute inset-0"
      />
      
      {map.current && isStyleLoaded && (
        <>
          <MapGeolocation map={map.current} />
          <MemoizedMapLayers
            map={map.current}
            venues={venues}
            visitedVenueIds={visitedVenueIds}
            onVenueSelect={memoizedVenueSelect}
            key={mapLayersKey}
          />
          <MapInteractions
            map={map.current}
            venues={venues}
            onVenueSelect={memoizedVenueSelect}
          />
        </>
      )}
      
      {selectedVenue && (
        <VenueSidebar 
          venue={selectedVenue} 
          onClose={handleVenueSidebarClose} 
        />
      )}
    </div>
  );
};

export default memo(Map, (prevProps, nextProps) => {
  // Only re-render Map if venues count changes significantly or selected venue changes
  return (
    prevProps.venues.length === nextProps.venues.length &&
    prevProps.selectedVenue?.id === nextProps.selectedVenue?.id &&
    JSON.stringify(prevProps.activeFilters) === JSON.stringify(nextProps.activeFilters) &&
    prevProps.lastFilterUpdateTime === nextProps.lastFilterUpdateTime
  );
});
