import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVenueFilters } from './useVenueFilters';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';

export function useVenueData() {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  
  // Fetch venues
  const { data: venues = [], error, isLoading, refetch } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch venue hours
  const { data: venueHours = [] } = useQuery({
    queryKey: ['venue-hours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venue_hours')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch happy hours
  const { data: happyHours = [] } = useQuery({
    queryKey: ['happy-hours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venue_happy_hours')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch daily specials
  const { data: dailySpecials = [] } = useQuery({
    queryKey: ['daily-specials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venue_daily_specials')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch events
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venue_events')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch breweries
  const { data: breweries = [] } = useQuery({
    queryKey: ['breweries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('breweries')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Process and organize the data
  const venueHoursMap = useMemo(() => {
    const map = {};
    venueHours.forEach(hour => {
      if (!map[hour.venue_id]) {
        map[hour.venue_id] = [];
      }
      map[hour.venue_id].push(hour);
    });
    return map;
  }, [venueHours]);
  
  const venueHappyHoursMap = useMemo(() => {
    const map = {};
    happyHours.forEach(hour => {
      if (!map[hour.venue_id]) {
        map[hour.venue_id] = [];
      }
      map[hour.venue_id].push(hour);
    });
    return map;
  }, [happyHours]);
  
  const venueDailySpecialsMap = useMemo(() => {
    const map = {};
    dailySpecials.forEach(special => {
      if (!map[special.venue_id]) {
        map[special.venue_id] = [];
      }
      map[special.venue_id].push(special);
    });
    return map;
  }, [dailySpecials]);
  
  const venueEventsMap = useMemo(() => {
    const map = {};
    events.forEach(event => {
      if (!map[event.venue_id]) {
        map[event.venue_id] = [];
      }
      map[event.venue_id].push(event);
    });
    return map;
  }, [events]);

  // Create a map of breweries by ID for easy lookup
  const breweriesMap = useMemo(() => {
    const map: Record<string, Brewery> = {};
    breweries.forEach(brewery => {
      map[brewery.id] = brewery;
    });
    return map;
  }, [breweries]);

  // Use the venue filters hook
  const {
    activeFilters,
    handleFilterChange,
    filteredVenues,
    lastFilterUpdateTime
  } = useVenueFilters(
    venues, 
    venueHoursMap, 
    venueHappyHoursMap, 
    venueDailySpecialsMap, 
    venueEventsMap,
    breweriesMap
  );
  
  return {
    venues: filteredVenues,
    allVenues: venues,
    error,
    isLoading,
    refetch,
    selectedVenue,
    setSelectedVenue,
    activeFilters,
    handleFilterChange,
    lastFilterUpdateTime
  };
}
