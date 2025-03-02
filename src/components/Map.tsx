
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
import { toast } from 'sonner';

interface MapProps {
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
  passwordReset?: boolean;
}

const Map = ({ breweries, onBrewerySelect, passwordReset = false }: MapProps) => {
  const { user } = useAuth();
  const { mapContainer, map, isStyleLoaded, reinitializeMap, resetMapInitializationState } = useMapInitialization();
  const [visitedBreweryIds, setVisitedBreweryIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const resetHandledRef = useRef(false);
  const resetTimerRef = useRef<number | null>(null);
  const initRetryCountRef = useRef(0);
  const maxRetries = 5;

  // Handle map reinitialization after password reset
  useEffect(() => {
    if (passwordReset && user && !resetHandledRef.current) {
      console.log('Reinitializing map after password reset');
      toast.success('Password has been reset successfully');
      
      // Mark that we've handled this reset
      resetHandledRef.current = true;
      
      // Clear any existing timer
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
      
      // First, completely reset the map initialization state
      resetMapInitializationState();
      
      // Then delay before attempting reinitialization
      resetTimerRef.current = window.setTimeout(() => {
        console.log('Executing complete map reset and reinitialization');
        
        // Force a complete rebuild of the map
        const result = reinitializeMap(true);
        
        if (!result) {
          console.log('Initial reinitialization failed, scheduling retry sequence');
          
          // If first attempt fails, set up a retry sequence with exponential backoff
          const retryWithBackoff = (attempt = 1) => {
            if (attempt <= maxRetries) {
              const delay = Math.min(2000 * Math.pow(1.5, attempt - 1), 10000); // Exponential backoff with cap
              console.log(`Scheduling retry ${attempt} in ${delay}ms`);
              
              resetTimerRef.current = window.setTimeout(() => {
                console.log(`Executing retry ${attempt}`);
                const success = reinitializeMap(true);
                
                if (!success && attempt < maxRetries) {
                  retryWithBackoff(attempt + 1);
                } else if (success) {
                  console.log(`Map successfully reinitialized on retry ${attempt}`);
                  initRetryCountRef.current = 0;
                } else {
                  console.log('Max retries reached, map reinitialization failed');
                  toast.error('Map failed to load. Please refresh the page.');
                }
              }, delay);
            }
          };
          
          retryWithBackoff();
        } else {
          console.log('Initial map reinitialization successful');
        }
      }, 1500);
    }
    
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };
  }, [passwordReset, user, reinitializeMap, resetMapInitializationState]);

  // Reset the handled flag when passwordReset becomes false
  useEffect(() => {
    if (!passwordReset) {
      resetHandledRef.current = false;
      initRetryCountRef.current = 0;
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
