
import React, { useEffect, useState, useCallback, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Venue } from '@/types/venue';
import MapLayers from './map/MapLayers';
import MapInteractions from './map/MapInteractions';
import MapGeolocation from './map/MapGeolocation';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import VenueSidebar from './venue/VenueSidebar';

interface MapProps {
  venues: Venue[];
  onVenueSelect: (venue: Venue | null) => void;
  selectedVenue?: Venue | null;
}

const Map = ({ venues, onVenueSelect, selectedVenue }: MapProps) => {
  const { user } = useAuth();
  const { mapContainer, map, isStyleLoaded } = useMapInitialization();
  const [visitedVenueIds, setVisitedVenueIds] = useState<string[]>([]);
  const [localSelectedVenue, setLocalSelectedVenue] = useState<Venue | null>(null);
  const queryClient = useQueryClient();
  
  // Debug: Log when props change
  useEffect(() => {
    console.log('Map: selectedVenue prop changed to:', selectedVenue?.name || 'null');
    
    if (selectedVenue) {
      console.log('Map: selectedVenue coordinates:', {
        lat: selectedVenue.latitude,
        lng: selectedVenue.longitude
      });
    }
  }, [selectedVenue]);

  // Always use the prop value if it's provided, otherwise use local state
  // This ensures proper synchronization between parent and child components
  useEffect(() => {
    if (selectedVenue !== undefined) {
      console.log('Map: Syncing localSelectedVenue with selectedVenue prop:', selectedVenue?.name || 'null');
      setLocalSelectedVenue(selectedVenue);
    }
  }, [selectedVenue]);

  // Use either the prop value or local state, prioritizing the prop value
  const activeVenue = selectedVenue !== undefined ? selectedVenue : localSelectedVenue;

  // Debug: Log the current active venue
  useEffect(() => {
    console.log('Map: Current active venue is:', activeVenue?.name || 'null');
  }, [activeVenue]);

  const { data: checkins, isLoading } = useQuery({
    queryKey: ['checkins', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('checkins')
        .select('venue_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      console.log(`Fetched ${data?.length || 0} check-ins for user ${user.id}`);
      return data || [];
    },
    enabled: !!user
  });

  const updateMap = useCallback(() => {
    if (map.current && isStyleLoaded) {
      console.log('Map venues updated, source will be refreshed');
    }
  }, [map, isStyleLoaded]);

  useEffect(() => {
    updateMap();
  }, [venues, updateMap]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('checkins-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checkins',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Checkin data changed, invalidating query');
          queryClient.invalidateQueries({ queryKey: ['checkins', user.id] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, queryClient]);

  useEffect(() => {
    if (user && checkins) {
      const uniqueVenueIds = [...new Set(checkins.map(checkin => checkin.venue_id))];
      console.log(`Setting ${uniqueVenueIds.length} unique visited venue IDs`);
      setVisitedVenueIds(uniqueVenueIds);
    } else if (!isLoading) {
      console.log('No user or checkins, clearing visited venue IDs');
      setVisitedVenueIds([]);
    }
  }, [checkins, user, isLoading]);

  // Update map when selectedVenue changes (zoom to venue location)
  useEffect(() => {
    if (selectedVenue && map.current && isStyleLoaded) {
      console.log('Map: Handling selectedVenue change:', selectedVenue.name);
      
      if (selectedVenue.latitude && selectedVenue.longitude) {
        try {
          console.log('Map: Attempting to zoom map to venue coordinates:', {
            lng: selectedVenue.longitude,
            lat: selectedVenue.latitude
          });
          
          const headerHeight = 73;
          const drawerHeight = window.innerHeight * 0.5; // 50% of viewport
          
          console.log('Map: Executing flyTo with coordinates:', {
            lng: parseFloat(selectedVenue.longitude), 
            lat: parseFloat(selectedVenue.latitude)
          });
          
          map.current.flyTo({
            center: [
              parseFloat(selectedVenue.longitude), 
              parseFloat(selectedVenue.latitude)
            ],
            offset: [0, -(drawerHeight / 2)], // Offset for drawer
            zoom: 15,
            duration: 1500
          });
          
          console.log('Map: flyTo method called successfully');
        } catch (error) {
          console.error('Error zooming to venue:', error);
        }
      } else {
        console.warn(
          'Cannot zoom to venue: Venue missing coordinates',
          {
            lng: selectedVenue.longitude,
            lat: selectedVenue.latitude
          }
        );
      }
    }
  }, [selectedVenue, map, isStyleLoaded]);

  const handleVenueSelect = useCallback((venue: Venue) => {
    console.log('Map: handleVenueSelect called with venue:', venue?.name || 'none');
    
    if (venue) {
      console.log('Map: Venue coordinates:', {
        lat: venue.latitude,
        lng: venue.longitude
      });
      
      // Create a clean copy to avoid reference issues
      const venueCopy = { ...venue };
      setLocalSelectedVenue(venueCopy);
      console.log('Map: setLocalSelectedVenue called with venue:', venue?.name || 'none');
      
      // Also notify parent component with the copy
      onVenueSelect(venueCopy);
      console.log('Map: onVenueSelect parent handler called');
    }
  }, [onVenueSelect]);

  const handleSidebarClose = useCallback(() => {
    console.log('Map: handleSidebarClose called');
    setLocalSelectedVenue(null);
    // Also notify parent component
    onVenueSelect(null);
    console.log('Map: onVenueSelect parent handler called with null');
  }, [onVenueSelect]);

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
      
      {/* Enhanced debug info */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="absolute top-20 left-4 p-2 bg-white/80 text-xs text-black rounded shadow z-50 max-w-xs overflow-auto max-h-96">
          <div className="mb-2 font-bold text-sm">Debug Info:</div>
          <div>Map Ready: {map.current ? 'Yes' : 'No'}</div>
          <div>Styles Loaded: {isStyleLoaded ? 'Yes' : 'No'}</div>
          <div className="mt-2 font-bold">Venue Selection:</div>
          <div>Selected Venue (prop): {selectedVenue?.name || 'None'}</div>
          <div>Local Selected Venue: {localSelectedVenue?.name || 'None'}</div>
          <div>Active Venue: {activeVenue?.name || 'None'}</div>
          {activeVenue && (
            <>
              <div className="mt-2 font-bold">Venue Details:</div>
              <div>ID: {activeVenue.id || 'N/A'}</div>
              <div>Name: {activeVenue.name || 'N/A'}</div>
              <div>Lat: {activeVenue.latitude || 'N/A'}</div>
              <div>Lng: {activeVenue.longitude || 'N/A'}</div>
              <div>City: {activeVenue.city || 'N/A'}</div>
            </>
          )}
        </div>
      )}
      
      {/* Only render sidebar if we have a valid active venue */}
      {activeVenue && activeVenue.id && (
        <VenueSidebar 
          venue={activeVenue} 
          onClose={handleSidebarClose}
        />
      )}
    </div>
  );
};

export default Map;
