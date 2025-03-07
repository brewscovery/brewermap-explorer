
import React, { useEffect, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Brewery } from '@/types/brewery';
import MapLayers from './map/MapLayers';
import MapInteractions from './map/MapInteractions';
import MapGeolocation from './map/MapGeolocation';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MapProps {
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
}

const Map = ({ breweries, onBrewerySelect }: MapProps) => {
  console.log('Map component rendering with', breweries.length, 'breweries');
  const { user } = useAuth();
  const { mapContainer, map, isStyleLoaded } = useMapInitialization();
  const [visitedBreweryIds, setVisitedBreweryIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Map style loaded state changed:', isStyleLoaded);
  }, [isStyleLoaded]);

  useEffect(() => {
    console.log('Map instance:', map.current ? 'exists' : 'null');
  }, [map.current]);

  // Fetch user's check-ins
  const { data: checkins } = useQuery({
    queryKey: ['checkins', user?.id],
    queryFn: async () => {
      console.log('Fetching checkins for user:', user?.id);
      if (!user) return [];
      const { data, error } = await supabase
        .from('checkins')
        .select('brewery_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      console.log('Fetched', data?.length || 0, 'checkins');
      return data || [];
    },
    enabled: !!user
  });

  // Subscribe to realtime changes on checkins
  useEffect(() => {
    if (!user) {
      console.log('No user, skipping realtime subscription');
      return;
    }

    console.log('Setting up realtime subscription for checkins');
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
          console.log('Realtime checkin change detected');
          queryClient.invalidateQueries({ queryKey: ['checkins', user.id] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      channel.unsubscribe();
    };
  }, [user, queryClient]);

  // Update visited breweries when check-ins data changes or when user logs out
  useEffect(() => {
    if (user && checkins) {
      console.log('Updating visited breweries with', checkins.length, 'checkins');
      const visited = checkins.map(checkin => checkin.brewery_id);
      setVisitedBreweryIds(visited);
    } else {
      console.log('Clearing visited breweries list');
      setVisitedBreweryIds([]);
    }
  }, [checkins, user]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      {map.current && isStyleLoaded ? (
        <>
          <MapGeolocation map={map.current} />
          <MapLayers
            map={map.current}
            breweries={breweries}
            visitedBreweryIds={visitedBreweryIds}
            onBrewerySelect={onBrewerySelect}
          />
          <MapInteractions
            map={map.current}
            breweries={breweries}
            onBrewerySelect={onBrewerySelect}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default Map;
