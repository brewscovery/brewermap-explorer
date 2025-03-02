
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
  const { mapContainer, map, isStyleLoaded, reinitializeMap } = useMapInitialization();
  const [visitedBreweryIds, setVisitedBreweryIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const resetHandledRef = useRef(false);
  const resetTimerRef = useRef<number | null>(null);
  const initRetryCountRef = useRef(0);
  const maxRetries = 5; // Increasing max retries

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
      
      // Increasing initial delay to ensure auth state has settled
      resetTimerRef.current = window.setTimeout(() => {
        const retryReinitialization = () => {
          if (initRetryCountRef.current < maxRetries) {
            console.log(`Executing map reinitialization after delay (attempt ${initRetryCountRef.current + 1})`);
            
            // Try to reinitialize
            const result = reinitializeMap();
            
            // If no success and still under max retries, try again after a delay
            if (!result && initRetryCountRef.current < maxRetries) {
              initRetryCountRef.current++;
              // Increasing delay between retries
              const retryDelay = 2000 + (initRetryCountRef.current * 1000);
              console.log(`Scheduling retry ${initRetryCountRef.current + 1} in ${retryDelay}ms`);
              resetTimerRef.current = window.setTimeout(retryReinitialization, retryDelay);
            } else if (result) {
              console.log('Map reinitialization successful');
              resetTimerRef.current = null;
            } else {
              console.log('Max reinitialization attempts reached');
              resetTimerRef.current = null;
              // Force a complete reinit as last resort
              window.setTimeout(() => {
                console.log('Attempting last resort full reinitialization');
                reinitializeMap(true);
              }, 5000);
            }
          } else {
            console.log('Max reinitialization attempts reached');
            resetTimerRef.current = null;
          }
        };
        
        retryReinitialization();
      }, 3000); // Increased initial delay
    }
    
    return () => {
      // Clean up timer if component unmounts
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };
  }, [passwordReset, user, reinitializeMap]);

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
