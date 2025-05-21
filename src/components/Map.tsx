
import React, { useEffect, useCallback, useState, memo, useMemo } from 'react';
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
const MemoizedMapLayers = memo(MapLayers);

const Map = ({ 
  venues, 
  onVenueSelect, 
  selectedVenue: selectedVenueFromProps,
  activeFilters = [],
  onFilterChange = () => {},
  lastFilterUpdateTime = 0
}: MapProps) => {
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
    onVenueSelect: (venue) => {
      setIsInternalSelection(true);
      onVenueSelect(venue);
    }, 
    selectedVenueFromProps 
  });
  
  // For debugging only
  const venueName = selectedVenue?.name || 'null';
  const filterCount = activeFilters.length;
  console.log(`Map: Render with selectedVenue: ${venueName}`);
  console.log(`Map: Rendering with ${venues.length} venues and ${filterCount} active filters`);

  // Force map resize when venues array changes
  useEffect(() => {
    if (map.current && isStyleLoaded) {
      const timer = setTimeout(() => {
        if (map.current) {
          map.current.resize();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [map, isStyleLoaded, venues.length]);

  // Custom sidebar close handler to ensure it clears the venue and search
  const handleVenueSidebarClose = () => {
    console.log("Map: Explicitly closing venue sidebar");
    handleSidebarClose();
    // Notify parent component to clear search bar and venue selection
    onVenueSelect(null);
  };

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
            onVenueSelect={handleVenueSelect}
            key={mapLayersKey}
          />
          <MapInteractions
            map={map.current}
            venues={venues}
            onVenueSelect={handleVenueSelect}
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

export default Map;
