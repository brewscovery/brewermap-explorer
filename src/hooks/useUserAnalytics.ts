
import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserAnalytics {
  uniqueVenuesVisited: number;
  totalVenues: number;
  venuesByState: Array<{
    state: string;
    visitedCount: number;
    totalCount: number;
  }>;
}

export const useUserAnalytics = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    console.log('Setting up realtime subscription for check-ins analytics');
    
    const channel = supabase
      .channel('checkins-analytics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checkins',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Check-in change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['userAnalytics', userId] });
        }
      )
      .subscribe((status) => {
        console.log('Checkins analytics channel subscription status:', status);
      });

    // Store channel reference for cleanup
    channelRef.current = channel;

    return () => {
      console.log('Cleaning up realtime subscription for check-ins analytics');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ['userAnalytics', userId],
    queryFn: async (): Promise<UserAnalytics> => {
      if (!userId) throw new Error('User ID is required');
      
      // Get user's visited venues by state
      const { data: visitedVenues, error: visitedError } = await supabase
        .from('checkins')
        .select(`
          venue_id,
          venues!inner(state)
        `)
        .eq('user_id', userId);
        
      if (visitedError) throw visitedError;
      
      // Get total venues by state
      const { data: allVenues, error: allVenuesError } = await supabase
        .from('venues')
        .select('state');
        
      if (allVenuesError) throw allVenuesError;
      
      // Process the data to get unique visited venues per state
      const visitedByState = new Map<string, Set<string>>();
      const totalByState = new Map<string, number>();
      
      // Count visited venues by state (unique venues only)
      visitedVenues?.forEach(checkin => {
        const state = checkin.venues.state;
        if (!visitedByState.has(state)) {
          visitedByState.set(state, new Set());
        }
        visitedByState.get(state)?.add(checkin.venue_id);
      });
      
      // Count total venues by state
      allVenues?.forEach(venue => {
        const state = venue.state;
        totalByState.set(state, (totalByState.get(state) || 0) + 1);
      });
      
      // Combine the data
      const venuesByState = Array.from(totalByState.entries()).map(([state, totalCount]) => ({
        state,
        visitedCount: visitedByState.get(state)?.size || 0,
        totalCount
      })).sort((a, b) => b.visitedCount - a.visitedCount);
      
      // Calculate total unique venues visited
      const allVisitedVenues = new Set<string>();
      visitedVenues?.forEach(checkin => {
        allVisitedVenues.add(checkin.venue_id);
      });
      
      return {
        uniqueVenuesVisited: allVisitedVenues.size,
        totalVenues: allVenues?.length || 0,
        venuesByState
      };
    },
    enabled: !!userId
  });
};
