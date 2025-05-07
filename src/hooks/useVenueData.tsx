
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';
import { useVenueSearch } from './useVenueSearch';
import { useVenueRealtimeUpdates } from './useVenueRealtimeUpdates';
import { useBreweryRealtimeUpdates } from './useBreweryRealtimeUpdates';
import { useVenueHoursRealtimeUpdates } from './useVenueHoursRealtimeUpdates';
import { useVenueHappyHoursRealtimeUpdates } from './useVenueHappyHoursRealtimeUpdates';
import { useQuery } from '@tanstack/react-query';
import { useVenueFilters } from './useVenueFilters';
import type { VenueHour } from '@/types/venueHours';
import type { VenueHappyHour } from '@/types/venueHappyHours';
import type { VenueDailySpecial } from '@/types/venueDailySpecials';

export const useVenueData = (initialSearchTerm = '', initialSearchType: 'name' | 'city' | 'country' = 'name') => {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  
  // Get venue search functionality
  const { 
    venues, 
    isLoading, 
    error, 
    refetch, 
    searchTerm,
    searchType,
    updateSearch
  } = useVenueSearch(initialSearchTerm, initialSearchType);

  // Set up realtime updates
  useVenueRealtimeUpdates(selectedVenue, setSelectedVenue);
  
  // Pass null for both parameters since we don't need to track brewery updates here
  useBreweryRealtimeUpdates(null, () => null);
  
  // Set up realtime updates for venue hours and happy hours when a venue is selected
  useVenueHoursRealtimeUpdates(selectedVenue?.id || null);
  useVenueHappyHoursRealtimeUpdates(selectedVenue?.id || null);

  // Reset search subscriptions when selectedVenue changes
  useEffect(() => {
    console.log('Selected venue changed:', selectedVenue?.name || 'none');
  }, [selectedVenue]);

  // Fetch hours data for all venues
  const { data: allVenueHours = {}, isLoading: isLoadingHours } = useQuery({
    queryKey: ['allVenueHours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venue_hours')
        .select('*');
      
      if (error) throw error;
      
      // Group hours by venue_id
      const hoursMap: Record<string, VenueHour[]> = {};
      data.forEach(hour => {
        if (!hoursMap[hour.venue_id]) {
          hoursMap[hour.venue_id] = [];
        }
        hoursMap[hour.venue_id].push(hour as VenueHour);
      });
      
      return hoursMap;
    }
  });

  // Fetch happy hours data for all venues
  const { data: allVenueHappyHours = {}, isLoading: isLoadingHappyHours } = useQuery({
    queryKey: ['allVenueHappyHours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venue_happy_hours')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Group happy hours by venue_id
      const happyHoursMap: Record<string, VenueHappyHour[]> = {};
      data.forEach(hour => {
        if (!happyHoursMap[hour.venue_id]) {
          happyHoursMap[hour.venue_id] = [];
        }
        happyHoursMap[hour.venue_id].push(hour as VenueHappyHour);
      });
      
      return happyHoursMap;
    }
  });

  // Fetch daily specials data for all venues
  const { data: allVenueDailySpecials = {}, isLoading: isLoadingDailySpecials } = useQuery({
    queryKey: ['allVenueDailySpecials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venue_daily_specials')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Group daily specials by venue_id
      const specialsMap: Record<string, VenueDailySpecial[]> = {};
      data.forEach(special => {
        if (!specialsMap[special.venue_id]) {
          specialsMap[special.venue_id] = [];
        }
        specialsMap[special.venue_id].push(special as VenueDailySpecial);
      });
      
      return specialsMap;
    }
  });

  // Fetch events data for all venues
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const { data: allVenueEvents = {}, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['allVenueEvents', today.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venue_events')
        .select('*')
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString())
        .eq('is_published', true);
      
      if (error) throw error;
      
      // Group events by venue_id
      const eventsMap: Record<string, any[]> = {};
      data.forEach(event => {
        if (!eventsMap[event.venue_id]) {
          eventsMap[event.venue_id] = [];
        }
        eventsMap[event.venue_id].push(event);
      });
      
      return eventsMap;
    }
  });

  // Use the filters hook
  const {
    activeFilters,
    handleFilterChange,
    filteredVenues
  } = useVenueFilters(
    venues,
    allVenueHours,
    allVenueHappyHours,
    allVenueDailySpecials,
    allVenueEvents
  );

  const isLoadingFilterData = isLoadingHours || isLoadingHappyHours || isLoadingDailySpecials || isLoadingEvents;

  return {
    venues: filteredVenues,
    allVenues: venues,
    isLoading: isLoading || isLoadingFilterData,
    error,
    refetch,
    selectedVenue,
    setSelectedVenue,
    searchTerm,
    searchType,
    updateSearch,
    // Filtering
    activeFilters,
    handleFilterChange
  };
};
