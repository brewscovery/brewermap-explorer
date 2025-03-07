
import React, { useEffect, useState, useCallback } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Brewery } from '@/types/brewery';
import MapLayers from './map/MapLayers';
import MapInteractions from './map/MapInteractions';
import MapGeolocation from './map/MapGeolocation';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface MapProps {
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
}

const Map = ({ breweries, onBrewerySelect }: MapProps) => {
  const { user } = useAuth();
  const { mapContainer, map, isStyleLoaded, initializeMap } = useMapInitialization();
  const [visitedBreweryIds, setVisitedBreweryIds] = useState<string[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapInitError, setMapInitError] = useState(false);
  const [initRetries, setInitRetries] = useState(0);
  const queryClient = useQueryClient();

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

  // Track when map is ready and handle loading state
  useEffect(() => {
    // Check if map is properly loaded
    if (isStyleLoaded && map.current) {
      console.log('Map is fully loaded and ready');
      setMapLoading(false);
      setMapInitError(false);
    } else {
      if (!mapLoading) {
        console.log('Map is not ready yet, showing loading state');
      }
      setMapLoading(true);
    }
    
    // Add a timeout to detect if map is taking too long to load
    const mapLoadTimeout = setTimeout(() => {
      if (mapLoading && initRetries < 3) {
        console.log('Map load timeout, may need to retry initialization');
        setMapInitError(true);
      }
    }, 10000); // 10 seconds timeout
    
    return () => clearTimeout(mapLoadTimeout);
  }, [isStyleLoaded, map, mapLoading, initRetries]);

  // Handler for manual map reinitialization
  const handleRetryInitialize = useCallback(() => {
    setInitRetries(prev => prev + 1);
    setMapInitError(false);
    setMapLoading(true);
    console.log('Manually retrying map initialization');
    initializeMap();
  }, [initializeMap]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {mapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <div className="text-center p-6 bg-card rounded-md shadow-lg">
            <span className="block text-lg font-medium mb-4">Loading map...</span>
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            
            {mapInitError && (
              <div className="mt-4">
                <p className="text-destructive mb-2">Map is taking longer than expected to load.</p>
                <Button 
                  onClick={handleRetryInitialize}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Retry Loading
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
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
