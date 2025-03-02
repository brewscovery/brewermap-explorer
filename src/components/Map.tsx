
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
  const { 
    mapContainer, 
    map, 
    isStyleLoaded, 
    resetMapInitializationState, 
    reinitializeMap 
  } = useMapInitialization();
  const [visitedBreweryIds, setVisitedBreweryIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const resetHandledRef = useRef(false);
  const resetTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;
  const passwordResetDetectedRef = useRef(false);

  // Handle map reinitialization after password reset
  useEffect(() => {
    if (passwordReset && user && !resetHandledRef.current) {
      console.log('Password reset detected, preparing map reset sequence', { passwordReset, userId: user.id });
      toast.success('Password has been reset successfully');
      
      // Mark that we've detected this password reset
      passwordResetDetectedRef.current = true;
      resetHandledRef.current = true;
      
      // Clear any existing timer
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
      
      const executeReset = () => {
        console.log('Executing map reset and reinitialization sequence - FULL RESET');
        
        // First completely reset the map initialization state
        const resetSuccess = resetMapInitializationState();
        console.log('Map state reset completed with status:', resetSuccess);
        
        // Delay before attempting reinitialization to ensure clean state
        resetTimerRef.current = window.setTimeout(() => {
          retryCountRef.current = 0;
          executeReinitialization();
        }, 500);
      };
      
      const executeReinitialization = () => {
        if (retryCountRef.current >= maxRetries) {
          console.error('Max retries reached, map reinitialization failed');
          toast.error('Map failed to load. Please refresh the page.');
          return;
        }
        
        retryCountRef.current++;
        const attempt = retryCountRef.current;
        
        console.log(`Executing map reinitialization attempt ${attempt}/${maxRetries} with FORCE=TRUE`);
        
        try {
          // Force a complete rebuild of the map with escalating timeouts
          const success = reinitializeMap(true);
          console.log(`Reinitialization attempt ${attempt} execution result:`, success);
          
          if (success) {
            console.log(`Map reinitialization successful on attempt ${attempt}`);
            retryCountRef.current = 0;
          } else {
            // If failed, retry with exponential backoff
            const delay = Math.min(1000 * Math.pow(1.5, attempt - 1), 8000);
            console.log(`Reinitialization attempt ${attempt} failed, retrying in ${delay}ms`);
            
            resetTimerRef.current = window.setTimeout(executeReinitialization, delay);
          }
        } catch (error) {
          console.error('Error during map reinitialization:', error);
          
          // Retry even after errors with longer delay
          const delay = Math.min(2000 * Math.pow(1.5, attempt - 1), 10000);
          resetTimerRef.current = window.setTimeout(executeReinitialization, delay);
        }
      };
      
      // Start the process
      executeReset();
    }
    
    return () => {
      // Clean up any pending timers
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };
  }, [passwordReset, user, reinitializeMap, resetMapInitializationState]);

  // Reset the handled flag when passwordReset becomes false
  useEffect(() => {
    if (!passwordReset && resetHandledRef.current) {
      console.log('Password reset flag changed to false, resetting handler state');
      resetHandledRef.current = false;
      retryCountRef.current = 0;
    }
  }, [passwordReset]);

  // Reset if we detect we're in a password reset state from parent component changes
  useEffect(() => {
    if (passwordReset && passwordResetDetectedRef.current === false && user) {
      console.log('Password reset state change detected, marking for reset');
      passwordResetDetectedRef.current = true;
      resetHandledRef.current = false; // Force reprocessing
    }
  }, [passwordReset, user]);

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
