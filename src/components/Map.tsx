
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
  console.log('[MapComponent] Rendering with', breweries.length, 'breweries');
  const { user } = useAuth();
  const { mapContainer, map, isStyleLoaded } = useMapInitialization();
  const [visitedBreweryIds, setVisitedBreweryIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('[MapComponent] Map has been created:', !!map.current, 'Style loaded:', isStyleLoaded);
  }, [map.current, isStyleLoaded]);

  // Fetch user's check-ins
  const { data: checkins } = useQuery({
    queryKey: ['checkins', user?.id],
    queryFn: async () => {
      console.log('[MapComponent] Fetching checkins for user:', user?.id);
      if (!user) return [];
      const { data, error } = await supabase
        .from('checkins')
        .select('brewery_id')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('[MapComponent] Error fetching checkins:', error);
        throw error;
      }
      console.log('[MapComponent] Fetched', data?.length, 'checkins');
      return data || [];
    },
    enabled: !!user
  });

  // Subscribe to realtime changes on checkins
  useEffect(() => {
    if (!user) {
      console.log('[MapComponent] No user, skipping realtime subscription');
      return;
    }

    console.log('[MapComponent] Setting up realtime subscription for checkins');
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
        (payload) => {
          console.log('[MapComponent] Checkins change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['checkins', user.id] });
        }
      )
      .subscribe();

    console.log('[MapComponent] Realtime subscription established');
    
    return () => {
      console.log('[MapComponent] Cleaning up realtime subscription');
      channel.unsubscribe();
    };
  }, [user, queryClient]);

  // Update visited breweries when check-ins data changes or when user logs out
  useEffect(() => {
    if (user && checkins) {
      console.log('[MapComponent] Updating visited breweries from', checkins.length, 'checkins');
      const visited = checkins.map(checkin => checkin.brewery_id);
      setVisitedBreweryIds(visited);
    } else {
      console.log('[MapComponent] Clearing visited breweries list');
      setVisitedBreweryIds([]);
    }
  }, [checkins, user]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      {map.current && isStyleLoaded ? (
        <>
          {console.log('[MapComponent] Rendering map children - map ready')}
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
        console.log('[MapComponent] Map or style not ready yet, waiting to render children')
      )}
    </div>
  );
};

export default Map;
