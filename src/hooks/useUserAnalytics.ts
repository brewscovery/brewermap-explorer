
import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

interface UserAnalytics {
  uniqueVenuesVisited: number;
  totalVenues: number;
  venuesByState: Array<{
    state: string;
    visitedCount: number;
    totalCount: number;
  }>;
  venuesByCountry: Array<{
    country: string;
    visitedCount: number;
    totalCount: number;
  }>;
  availableCountries: string[];
  weeklyCheckIns: Array<{
    week: string;
    checkIns: number;
    weekStart: Date;
    venues: Array<{
      venueName: string;
      checkInCount: number;
    }>;
  }>;
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
          visited_at,
          venues!inner(name, state, country)
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
      
      // Combine the data for states
      const venuesByState = Array.from(totalByState.entries()).map(([state, totalCount]) => ({
        state,
        visitedCount: visitedByState.get(state)?.size || 0,
        totalCount
      })).sort((a, b) => b.visitedCount - a.visitedCount);
      
      // Process country data - show all countries with venues
      const visitedByCountry = new Map<string, Set<string>>();
      const totalByCountry = new Map<string, number>();
      
      // Count visited venues by country (unique venues only)
      visitedVenues?.forEach(checkin => {
        const country = checkin.venues.country;
        if (country) {
          if (!visitedByCountry.has(country)) {
            visitedByCountry.set(country, new Set());
          }
          visitedByCountry.get(country)?.add(checkin.venue_id);
        }
      });
      
      // Count total venues by country
      allVenues?.forEach(venue => {
        const country = venue.country;
        if (country) {
          totalByCountry.set(country, (totalByCountry.get(country) || 0) + 1);
        }
      });
      
      // Combine the data for countries - include all countries with venues
      const venuesByCountry = Array.from(totalByCountry.entries()).map(([country, totalCount]) => ({
        country,
        visitedCount: visitedByCountry.get(country)?.size || 0,
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
      
      // Process weekly check-ins data with venue breakdown
      const weeklyCheckInsMap = new Map<string, { count: number; venues: Map<string, number>; weekStart: Date }>();
      const now = new Date();
      
      // Initialize all weeks for the last 13 weeks with 0 check-ins
      for (let i = 12; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(now, i));
        const weekKey = format(weekStart, 'MMM dd');
        weeklyCheckInsMap.set(weekKey, { 
          count: 0, 
          venues: new Map<string, number>(),
          weekStart 
        });
      }
      
      // Count check-ins per week with venue breakdown
      visitedVenues?.forEach(checkin => {
        const checkinDate = new Date(checkin.visited_at);
        const weekStart = startOfWeek(checkinDate);
        
        // Only include check-ins from the last 13 weeks
        if (checkinDate >= startOfWeek(subWeeks(now, 12)) && checkinDate <= now) {
          const weekKey = format(weekStart, 'MMM dd');
          const weekData = weeklyCheckInsMap.get(weekKey);
          
          if (weekData) {
            weekData.count += 1;
            const venueName = checkin.venues.name;
            const currentVenueCount = weekData.venues.get(venueName) || 0;
            weekData.venues.set(venueName, currentVenueCount + 1);
          }
        }
      });
      
      // Convert to array format for the chart
      const weeklyCheckIns = Array.from(weeklyCheckInsMap.entries()).map(([week, data]) => ({
        week,
        checkIns: data.count,
        weekStart: data.weekStart,
        venues: Array.from(data.venues.entries())
          .map(([venueName, checkInCount]) => ({ venueName, checkInCount }))
          .sort((a, b) => b.checkInCount - a.checkInCount)
      }));
      
      return {
        uniqueVenuesVisited: allVisitedVenues.size,
        totalVenues: totalVenuesInCountry,
        venuesByState,
        venuesByCountry,
        availableCountries,
        weeklyCheckIns
      };
    },
    enabled: !!userId
  });
};
