
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
  const { user } = useAuth();
  const { mapContainer, map, isStyleLoaded } = useMapInitialization();
  const [visitedBreweryIds, setVisitedBreweryIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const [hasInitializedMap, setHasInitializedMap] = useState(false);

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

  // Function to fly to a brewery's location
  const flyToBrewery = (brewery: Brewery) => {
    if (!map.current || !brewery.longitude || !brewery.latitude) return;

    const lng = parseFloat(brewery.longitude);
    const lat = parseFloat(brewery.latitude);
    
    if (isNaN(lng) || isNaN(lat)) return;

    map.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      essential: true
    });
  };

  // Watch for brewery selection changes
  useEffect(() => {
    // Skip if this is the initial map load
    if (!hasInitializedMap) {
      setHasInitializedMap(true);
      return;
    }

    const selectedBrewery = breweries[0];
    if (selectedBrewery?.longitude && selectedBrewery?.latitude) {
      flyToBrewery(selectedBrewery);
    }
  }, [breweries, hasInitializedMap]);

  // Force a re-render of map layers when style is loaded or breweries change
  useEffect(() => {
    if (!map.current || !isStyleLoaded) return;

    const forceRender = () => {
      if (map.current?.isStyleLoaded()) {
        // Trigger a moveend event to force layers to re-render
        map.current.fire('moveend');
      }
    };

    // Small delay to ensure style is fully processed
    const timer = setTimeout(forceRender, 100);

    return () => clearTimeout(timer);
  }, [map, isStyleLoaded, breweries]);

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
