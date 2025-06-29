
import React, { useEffect, useCallback, useState, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Venue } from '@/types/venue';
import MapLayers from './map/layers/MapLayers';
import MapInteractions from './map/MapInteractions';
import MapGeolocation from './map/MapGeolocation';
import MapLoadingSkeleton from './map/MapLoadingSkeleton';
import { useOptimizedMapInitialization } from '@/hooks/useOptimizedMapInitialization';
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
  isLoadingVenues?: boolean;
  loadingProgress?: number;
  venueCount?: number;
  totalVenueCount?: number;
}

// Optimized MapLayers with better memoization
const OptimizedMapLayers = memo(MapLayers, (prevProps, nextProps) => {
  // More selective re-rendering
  const venuesChanged = prevProps.venues.length !== nextProps.venues.length ||
    (prevProps.venues.length > 0 && nextProps.venues.length > 0 && 
     prevProps.venues[0]?.id !== nextProps.venues[0]?.id);
  
  const visitedChanged = JSON.stringify(prevProps.visitedVenueIds?.sort()) !== 
    JSON.stringify(nextProps.visitedVenueIds?.sort());
  
  return !venuesChanged && !visitedChanged;
});

const Map = ({ 
  venues, 
  onVenueSelect, 
  selectedVenue: selectedVenueFromProps,
  activeFilters = [],
  onFilterChange = () => {},
  lastFilterUpdateTime = 0,
  isLoadingVenues = false,
  loadingProgress = 0,
  venueCount = 0,
  totalVenueCount
}: MapProps) => {
  const navigate = useNavigate();
  const { mapContainer, map, isStyleLoaded, isInitializing, initializationProgress } = useOptimizedMapInitialization();
  const { visitedVenueIds } = useVisitedVenues();
  
  const [isInternalSelection, setIsInternalSelection] = useState(false);
  
  // Show loading skeleton while map is initializing or venues are loading
  const showLoadingSkeleton = isInitializing || (isLoadingVenues && venues.length === 0);
  const combinedProgress = isInitializing ? 
    initializationProgress * 0.3 + loadingProgress * 0.7 : // 30% map init, 70% venue loading
    loadingProgress;
  
  // Create stable key for MapLayers - only update when filter composition changes
  const filtersKey = activeFilters.join('-');
  const mapLayersKey = useMemo(() => 
    `venues-${filtersKey}-${lastFilterUpdateTime}-${venues.length}`, 
    [filtersKey, lastFilterUpdateTime, venues.length]
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
  
  // Optimized map resize - only when necessary
  useEffect(() => {
    if (map.current && isStyleLoaded && venues.length > 0 && !isInitializing) {
      const timer = setTimeout(() => {
        if (map.current && !map.current._removed) {
          map.current.resize();
        }
      }, 200); // Reduced timeout
      return () => clearTimeout(timer);
    }
  }, [map, isStyleLoaded, venues.length, isInitializing]);

  const handleVenueSidebarClose = useCallback(() => {
    console.log("Map: Closing venue sidebar (optimized)");
    handleSidebarClose();
    onVenueSelect(null);
    navigate('/', { replace: true });
  }, [handleSidebarClose, onVenueSelect, navigate]);

  const memoizedVenueSelect = useCallback((venue: Venue) => {
    handleVenueSelect(venue);
  }, [handleVenueSelect]);

  return (
    <div className="relative flex-1 w-full h-full">
      <div 
        ref={mapContainer} 
        className="absolute inset-0"
      />
      
      {/* Show loading skeleton during initialization */}
      {showLoadingSkeleton && (
        <MapLoadingSkeleton 
          progress={combinedProgress}
          venueCount={venueCount}
          totalCount={totalVenueCount}
        />
      )}
      
      {/* Only render map layers when map is ready and we have venues */}
      {map.current && isStyleLoaded && !isInitializing && (
        <>
          <MapGeolocation map={map.current} />
          {venues.length > 0 && (
            <OptimizedMapLayers
              map={map.current}
              venues={venues}
              visitedVenueIds={visitedVenueIds}
              onVenueSelect={memoizedVenueSelect}
              key={mapLayersKey}
            />
          )}
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
  // Optimized comparison for Map re-rendering
  return (
    prevProps.venues.length === nextProps.venues.length &&
    prevProps.selectedVenue?.id === nextProps.selectedVenue?.id &&
    JSON.stringify(prevProps.activeFilters) === JSON.stringify(nextProps.activeFilters) &&
    prevProps.lastFilterUpdateTime === nextProps.lastFilterUpdateTime &&
    prevProps.isLoadingVenues === nextProps.isLoadingVenues &&
    prevProps.loadingProgress === nextProps.loadingProgress
  );
});
