
import React, { useEffect, useState, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Brewery } from '@/types/brewery';
import MapLayers from './map/MapLayers';
import MapInteractions from './map/MapInteractions';
import MapGeolocation from './map/MapGeolocation';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

interface MapProps {
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
  passwordReset?: boolean;
}

const Map = ({ breweries, onBrewerySelect, passwordReset = false }: MapProps) => {
  const { user } = useAuth();
  const { mapContainer, map, isStyleLoaded, reinitializeMap } = useMapInitialization();
  const [searchParams] = useSearchParams();
  const [visitedBreweryIds, setVisitedBreweryIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const resetHandledRef = useRef(false);

  // Handle map reinitialization after password reset
  useEffect(() => {
    if (passwordReset && user && !resetHandledRef.current) {
      console.log('Reinitializing map after password reset');
      toast.success('Password has been reset successfully');
      
      // Mark that we've handled this reset
      resetHandledRef.current = true;
      
      // Use a short delay to ensure auth state has fully updated
      setTimeout(() => {
        reinitializeMap();
      }, 500);
    }
  }, [passwordReset, user, reinitializeMap]);

  // Reset the handled flag when passwordReset becomes false
  useEffect(() => {
    if (!passwordReset) {
      resetHandledRef.current = false;
    }
  }, [passwordReset]);

  // Fetch user's check-ins
  const { data: checkins } = useQuery({
    queryKey: ['checkins', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('checkins')
        .select('brewery_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

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

  // Update visited breweries when check-ins data changes or when user logs out
  useEffect(() => {
    if (user && checkins) {
      const visited = checkins.map(checkin => checkin.brewery_id);
      setVisitedBreweryIds(visited);
    } else {
      setVisitedBreweryIds([]);
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
      )}
    </div>
  );
};

export default Map;
