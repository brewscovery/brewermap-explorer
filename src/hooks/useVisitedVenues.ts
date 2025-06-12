
import { useState, useEffect, useCallback } from 'react';
import { useOptimizedSupabaseQuery } from './useOptimizedSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CheckIn {
  id: string;
  venue_id: string;
  user_id: string;
  visited_at: string;
}

export const useVisitedVenues = () => {
  const { user } = useAuth();
  const [visitedVenueIds, setVisitedVenueIds] = useState<string[]>([]);

  const { data: checkins = [], isLoading } = useOptimizedSupabaseQuery<CheckIn[]>(
    ['checkins', user?.id],
    'checkins',
    async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    'HIGH',
    300000, // 5 minutes stale time
    !!user // Only run query if user exists
  );

  // Update visited venue IDs when checkins change, but avoid unnecessary updates
  useEffect(() => {
    if (!user) {
      // Only update if current state is not already empty
      if (visitedVenueIds.length > 0) {
        console.log('No user, clearing visited venue IDs');
        setVisitedVenueIds([]);
      }
      return;
    }

    if (checkins && Array.isArray(checkins)) {
      const newVenueIds = checkins.map(checkin => checkin.venue_id);
      
      // Only update if the IDs have actually changed
      if (JSON.stringify(newVenueIds.sort()) !== JSON.stringify(visitedVenueIds.sort())) {
        console.log('Updating visited venue IDs:', newVenueIds);
        setVisitedVenueIds(newVenueIds);
      }
    }
  }, [checkins, user, visitedVenueIds]);

  const addVisitedVenue = useCallback((venueId: string) => {
    setVisitedVenueIds(prev => {
      if (prev.includes(venueId)) {
        return prev; // No change needed
      }
      return [...prev, venueId];
    });
  }, []);

  const removeVisitedVenue = useCallback((venueId: string) => {
    setVisitedVenueIds(prev => {
      if (!prev.includes(venueId)) {
        return prev; // No change needed
      }
      return prev.filter(id => id !== venueId);
    });
  }, []);

  return {
    visitedVenueIds,
    isLoading,
    addVisitedVenue,
    removeVisitedVenue
  };
};
