
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
  availableCountries: string[];
}

export const useUserAnalytics = (userId: string | undefined, selectedCountry?: string) => {
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
          queryClient.invalidateQueries({ queryKey: ['userAnalytics', userId, selectedCountry] });
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
  }, [userId, queryClient, selectedCountry]);

  return useQuery({
    queryKey: ['userAnalytics', userId, selectedCountry],
    queryFn: async (): Promise<UserAnalytics> => {
      if (!userId) throw new Error('User ID is required');
      
      // Get user's visited venues by state and country
      const { data: visitedVenues, error: visitedError } = await supabase
        .from('checkins')
        .select(`
          venue_id,
          venues!inner(state, country)
        `)
        .eq('user_id', userId);
        
      if (visitedError) throw visitedError;
      
      // Get total venues by state and country
      const { data: allVenues, error: allVenuesError } = await supabase
        .from('venues')
        .select('state, country');
        
      if (allVenuesError) throw allVenuesError;
      
      // Get all available countries from user's visited venues
      const availableCountries = [...new Set(
        visitedVenues?.map(checkin => checkin.venues.country).filter(Boolean) || []
      )].sort();
      
      // Use the selected country or default to the first available
      const countryToFilter = selectedCountry || availableCountries[0] || 'United States';
      
      // Process the data to get unique visited venues per state for the selected country
      const visitedByState = new Map<string, Set<string>>();
      const totalByState = new Map<string, number>();
      
      // Count visited venues by state (unique venues only) for the selected country
      visitedVenues?.forEach(checkin => {
        if (checkin.venues.country === countryToFilter) {
          const state = checkin.venues.state;
          if (!visitedByState.has(state)) {
            visitedByState.set(state, new Set());
          }
          visitedByState.get(state)?.add(checkin.venue_id);
        }
      });
      
      // Count total venues by state for the selected country
      allVenues?.forEach(venue => {
        if (venue.country === countryToFilter) {
          const state = venue.state;
          totalByState.set(state, (totalByState.get(state) || 0) + 1);
        }
      });
      
      // Combine the data
      const venuesByState = Array.from(totalByState.entries()).map(([state, totalCount]) => ({
        state,
        visitedCount: visitedByState.get(state)?.size || 0,
        totalCount
      })).sort((a, b) => b.visitedCount - a.visitedCount);
      
      // Calculate total unique venues visited (for the selected country)
      const allVisitedVenues = new Set<string>();
      visitedVenues?.forEach(checkin => {
        if (checkin.venues.country === countryToFilter) {
          allVisitedVenues.add(checkin.venue_id);
        }
      });
      
      // Calculate total venues for the selected country
      const totalVenuesInCountry = allVenues?.filter(venue => venue.country === countryToFilter).length || 0;
      
      return {
        uniqueVenuesVisited: allVisitedVenues.size,
        totalVenues: totalVenuesInCountry,
        venuesByState,
        availableCountries
      };
    },
    enabled: !!userId
  });
};
