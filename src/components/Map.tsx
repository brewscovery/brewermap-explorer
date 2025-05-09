
import React, { useEffect, useCallback, useState } from 'react';
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
}

const Map = ({ 
  venues, 
  onVenueSelect, 
  selectedVenue: selectedVenueFromProps,
  activeFilters = [],
  onFilterChange = () => {}
}: MapProps) => {
  const { mapContainer, map, isStyleLoaded } = useMapInitialization();
  const { visitedVenueIds } = useVisitedVenues();
  const [mapInstanceKey, setMapInstanceKey] = useState<string>(`map-${Date.now()}`);
  
  const { 
    selectedVenue,
    handleVenueSelect,
    handleSidebarClose
  } = useVenueMapInteraction({ 
    map: map.current, 
    onVenueSelect, 
    selectedVenueFromProps 
  });
  
  console.log('Map: Render with selectedVenue:', selectedVenue?.name || 'null');
  console.log(`Map: Rendering with ${venues.length} venues and ${activeFilters.length} active filters`);

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

  // Removed the effect that was refreshing map layers on visibility/focus changes

  return (
    <div className="relative flex-1 w-full h-full">
      <div 
        ref={mapContainer} 
        className="absolute inset-0"
      />
      
      {map.current && isStyleLoaded && (
        <>
          <MapGeolocation map={map.current} />
          <MapLayers
            map={map.current}
            venues={venues}
            visitedVenueIds={visitedVenueIds}
            onVenueSelect={handleVenueSelect}
            key={`${mapInstanceKey}-layers-${venues.length}-${activeFilters.join('-')}`}
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
          onClose={handleSidebarClose}
        />
      )}
    </div>
  );
};

export default Map;
