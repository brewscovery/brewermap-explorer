
import React, { useEffect, useCallback } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Venue } from '@/types/venue';
import MapLayers from './map/layers/MapLayers';
import MapInteractions from './map/MapInteractions';
import MapGeolocation from './map/MapGeolocation';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useVisitedVenues } from '@/hooks/useVisitedVenues';
import { useVenueMapInteraction } from '@/hooks/useVenueMapInteraction';
import VenueSidebar from './venue/VenueSidebar';
import MapFilters from './search/MapFilters';

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

  // Force map resize and recenter when venues array changes
  useEffect(() => {
    if (map.current && isStyleLoaded) {
      const timer = setTimeout(() => {
        if (map.current) {
          map.current.resize();
          
          // If venues exist, adjust the map view to fit them
          if (venues.length > 0) {
            setTimeout(() => {
              if (!map.current) return;
              
              // This forces a redraw of the map layers
              const currentZoom = map.current.getZoom();
              map.current.setZoom(currentZoom - 0.1);
              setTimeout(() => {
                if (map.current) map.current.setZoom(currentZoom);
              }, 150);
            }, 300);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [map, isStyleLoaded, venues.length]);

  return (
    <div className="relative flex-1 w-full h-full">
      <div 
        ref={mapContainer} 
        className="absolute inset-0"
      />
      
      {/* Filters positioned after search bar */}
      <div className="absolute top-20 left-4 right-4 z-20">
        <MapFilters 
          activeFilters={activeFilters} 
          onFilterChange={onFilterChange} 
          className="justify-center sm:justify-start"
        />
      </div>
      
      {map.current && isStyleLoaded && (
        <>
          <MapGeolocation map={map.current} />
          <MapLayers
            map={map.current}
            venues={venues}
            visitedVenueIds={visitedVenueIds}
            onVenueSelect={handleVenueSelect}
            key={`map-layers-${venues.length}-${activeFilters.join('-')}`}
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
