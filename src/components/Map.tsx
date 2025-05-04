
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
    if (!selectedVenue || !map.current || !isStyleLoaded) return;
    
    console.log('Map: Handling selectedVenue change:', selectedVenue.name);
    
    if (!selectedVenue.latitude || !selectedVenue.longitude) {
      console.warn('Cannot zoom to venue: Missing coordinates', {
        lat: selectedVenue.latitude,
        lng: selectedVenue.longitude
      });
      return;
    }
    
    try {
      console.log('Map: Zooming map to venue coordinates:', {
        lng: selectedVenue.longitude,
        lat: selectedVenue.latitude
      });
      
      const coordinates = [
        parseFloat(selectedVenue.longitude), 
        parseFloat(selectedVenue.latitude)
      ];
      
      // Calculate offset for the drawer
      const headerHeight = 73;
      const drawerHeight = window.innerHeight * 0.5; // 50% of viewport
      
      map.current.flyTo({
        center: coordinates,
        offset: [0, -(drawerHeight / 2)], // Offset for drawer
        zoom: 15,
        duration: 1500
      });
      
      console.log('Map: flyTo method called successfully');
    } catch (error) {
      console.error('Error zooming to venue:', error);
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
      
      // Also notify parent component with the copy
      onVenueSelect(venueCopy);
      console.log('Map: onVenueSelect parent handler called with venue:', venueCopy.name);
    }
  }, [onVenueSelect]);

  const handleSidebarClose = useCallback(() => {
    console.log('Map: handleSidebarClose called');
    // Notify parent component
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
          <div>Selected Venue: {selectedVenue?.name || 'None'}</div>
          {selectedVenue && (
            <>
              <div className="mt-2 font-bold">Venue Details:</div>
              <div>ID: {selectedVenue.id || 'N/A'}</div>
              <div>Name: {selectedVenue.name || 'N/A'}</div>
              <div>Lat: {selectedVenue.latitude || 'N/A'}</div>
              <div>Lng: {selectedVenue.longitude || 'N/A'}</div>
              <div>City: {selectedVenue.city || 'N/A'}</div>
            </>
          )}
        </div>
      )}
      
      {/* Only render sidebar if we have a valid selected venue */}
      {selectedVenue && selectedVenue.id && selectedVenue.name && (
        <VenueSidebar 
          venue={selectedVenue} 
          onClose={handleSidebarClose}
        />
      )}
    </div>
  );
};

export default Map;
