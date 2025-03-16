
import React, { useEffect, useState, useCallback } from 'react';
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
  onVenueSelect: (venue: Venue) => void;
}

const Map = ({ venues, onVenueSelect }: MapProps) => {
  const { user } = useAuth();
  const { mapContainer, map, isStyleLoaded } = useMapInitialization();
  const [visitedVenueIds, setVisitedVenueIds] = useState<string[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const queryClient = useQueryClient();

  // Fetch user's check-ins
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

  // Handle map updates when venues change
  const updateMap = useCallback(() => {
    if (map.current && isStyleLoaded) {
      // The MapLayers component will handle updating the GeoJSON source
      console.log('Map venues updated, source will be refreshed');
    }
  }, [map, isStyleLoaded]);

  // Call updateMap when venues change
  useEffect(() => {
    updateMap();
  }, [venues, updateMap]);

  // Subscribe to realtime changes on checkins
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

  // Update visited venues when check-ins data changes or when user logs out
  useEffect(() => {
    if (user && checkins) {
      // Extract unique venue IDs using a Set
      const uniqueVenueIds = [...new Set(checkins.map(checkin => checkin.venue_id))];
      console.log(`Setting ${uniqueVenueIds.length} unique visited venue IDs`);
      setVisitedVenueIds(uniqueVenueIds);
    } else if (!isLoading) {
      console.log('No user or checkins, clearing visited venue IDs');
      setVisitedVenueIds([]);
    }
  }, [checkins, user, isLoading]);

  // Handle venue selection from map interactions
  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    onVenueSelect(venue);
  };

  // Handle sidebar closing
  const handleSidebarClose = () => {
    setSelectedVenue(null);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
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
      
      {/* Venue sidebar */}
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
