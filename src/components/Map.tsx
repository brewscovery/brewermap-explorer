
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

interface MapProps {
  venues: Venue[];
  onVenueSelect: (venue: Venue) => void;
}

const Map = ({ venues, onVenueSelect }: MapProps) => {
  const { user } = useAuth();
  const { mapContainer, map, isStyleLoaded } = useMapInitialization();
  const [visitedVenueIds, setVisitedVenueIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch user's check-ins
  const { data: checkins } = useQuery({
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
      const visited = checkins.map(checkin => checkin.venue_id);
      console.log(`Setting ${visited.length} visited venue IDs`);
      setVisitedVenueIds(visited);
    } else {
      setVisitedVenueIds([]);
    }
  }, [checkins, user]);

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
            onVenueSelect={onVenueSelect}
          />
          <MapInteractions
            map={map.current}
            venues={venues}
            onVenueSelect={onVenueSelect}
          />
        </>
      )}
    </div>
  );
};

export default Map;
