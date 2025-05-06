
import React, { useEffect, useCallback, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Venue } from '@/types/venue';
import MapLayers from './map/MapLayers';
import MapInteractions from './map/MapInteractions';
import MapGeolocation from './map/MapGeolocation';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useVisitedVenues } from '@/hooks/useVisitedVenues';
import { useVenueMapInteraction } from '@/hooks/useVenueMapInteraction';
import VenueSidebar from './venue/VenueSidebar';
import { Skeleton } from '@/components/ui/skeleton';

interface MapProps {
  venues: Venue[];
  onVenueSelect: (venue: Venue | null) => void;
  selectedVenue?: Venue | null;
}

const Map = ({ venues, onVenueSelect, selectedVenue: selectedVenueFromProps }: MapProps) => {
  const { mapContainer, map, isStyleLoaded } = useMapInitialization();
  const { visitedVenueIds } = useVisitedVenues();
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const { 
    selectedVenue,
    handleVenueSelect,
    handleSidebarClose,
    isMapReady
  } = useVenueMapInteraction({ 
    map: map.current, 
    onVenueSelect, 
    selectedVenueFromProps 
  });
  
  console.log('Map: Render with selectedVenue:', selectedVenue?.name || 'null');
  console.log('Map initialization status:', {
    mapInstance: !!map.current,
    styleLoaded: isStyleLoaded,
    mapReady: isMapReady
  });

  // Set timeout to detect if the map is taking too long to initialize
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isStyleLoaded && map.current) {
        console.warn('Map is taking too long to load style');
        
        // Try to reinitialize the map
        try {
          if (map.current && mapContainer.current) {
            console.log('Attempting to force style reload');
            map.current.once('style.load', () => {
              console.log('Style successfully reloaded');
              setMapLoadError(null);
            });
            
            map.current.setStyle(map.current.getStyle().sprite);
          }
        } catch (err) {
          console.error('Error attempting to reload map style:', err);
        }
      }
      
      setIsInitializing(false);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [isStyleLoaded, map]);
  
  // Reset error state when style loads successfully
  useEffect(() => {
    if (isStyleLoaded) {
      setMapLoadError(null);
      setIsInitializing(false);
    }
  }, [isStyleLoaded]);

  const updateMap = useCallback(() => {
    if (map.current && isStyleLoaded) {
      console.log('Map venues updated, source will be refreshed');
    }
  }, [map, isStyleLoaded]);

  useEffect(() => {
    updateMap();
  }, [venues, updateMap]);

  // Render loading state while the map is initializing
  if (isInitializing) {
    return (
      <div className="relative flex-1 w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          <Skeleton className="h-[60vh] w-[90vw] rounded-lg" />
          <p className="mt-4 text-muted-foreground animate-pulse">Initializing map...</p>
        </div>
      </div>
    );
  }

  // Render error state if map failed to load
  if (mapLoadError) {
    return (
      <div className="relative flex-1 w-full h-full flex items-center justify-center">
        <div className="text-center p-6 bg-destructive/10 rounded-lg max-w-md">
          <h3 className="text-xl font-bold text-destructive mb-2">Map Error</h3>
          <p className="mb-4">{mapLoadError}</p>
          <p className="text-sm text-muted-foreground">
            Please check your internet connection and try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

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
