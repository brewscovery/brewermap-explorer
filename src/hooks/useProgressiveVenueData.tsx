
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOptimizedSupabaseQuery } from './useOptimizedSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useVenueFilters } from './useVenueFilters';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';

const INITIAL_BATCH_SIZE = 100;
const SUBSEQUENT_BATCH_SIZE = 200;

export function useProgressiveVenueData() {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [loadedVenues, setLoadedVenues] = useState<Venue[]>([]);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreVenues, setHasMoreVenues] = useState(true);
  const [totalVenueCount, setTotalVenueCount] = useState<number | null>(null);

  // Load initial batch of venues
  const { data: initialVenues = [], error, isLoading, refetch } = useOptimizedSupabaseQuery<Venue[]>(
    ['venues', 'initial'],
    'venues',
    async () => {
      const { data, error, count } = await supabase
        .from('venues')
        .select('*', { count: 'exact' })
        .range(0, INITIAL_BATCH_SIZE - 1);
      
      if (error) throw error;
      
      // Store total count for pagination
      if (count !== null) {
        setTotalVenueCount(count);
        setHasMoreVenues(count > INITIAL_BATCH_SIZE);
      }
      
      return data || [];
    },
    'HIGH', // High priority for initial load
    60000 // 1 minute stale time
  );

  // Update loaded venues when initial venues are available
  useEffect(() => {
    if (initialVenues.length > 0 && loadedVenues.length === 0) {
      console.log(`Initial batch loaded: ${initialVenues.length} venues`);
      setLoadedVenues(initialVenues);
    }
  }, [initialVenues, loadedVenues.length]);

  // Load more venues progressively
  const loadMoreVenues = useCallback(async () => {
    if (isLoadingMore || !hasMoreVenues) return;
    
    setIsLoadingMore(true);
    
    try {
      const offset = (currentBatch + 1) * INITIAL_BATCH_SIZE;
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .range(offset, offset + SUBSEQUENT_BATCH_SIZE - 1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log(`Loaded batch ${currentBatch + 1}: ${data.length} venues`);
        setLoadedVenues(prev => [...prev, ...data]);
        setCurrentBatch(prev => prev + 1);
        
        // Check if we have more venues to load
        if (totalVenueCount !== null) {
          const totalLoaded = loadedVenues.length + data.length;
          setHasMoreVenues(totalLoaded < totalVenueCount);
        }
      } else {
        setHasMoreVenues(false);
      }
    } catch (error) {
      console.error('Error loading more venues:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentBatch, hasMoreVenues, isLoadingMore, loadedVenues.length, totalVenueCount]);

  // Auto-load more venues when user scrolls or zooms out
  useEffect(() => {
    if (!isLoading && hasMoreVenues && loadedVenues.length < 500) {
      const timer = setTimeout(() => {
        loadMoreVenues();
      }, 2000); // Load next batch after 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [loadedVenues.length, hasMoreVenues, isLoading, loadMoreVenues]);

  // Load venue-related data progressively (only for visible venues)
  const { data: venueHours = [] } = useOptimizedSupabaseQuery<any[]>(
    ['venue-hours', 'progressive'],
    'venue_hours',
    async () => {
      if (loadedVenues.length === 0) return [];
      
      const venueIds = loadedVenues.slice(0, 200).map(v => v.id); // Only load hours for first 200 venues
      const { data, error } = await supabase
        .from('venue_hours')
        .select('*')
        .in('venue_id', venueIds);
      
      if (error) throw error;
      return data || [];
    },
    'NORMAL',
    300000,
    loadedVenues.length > 0
  );

  // Load other venue data progressively
  const { data: happyHours = [] } = useOptimizedSupabaseQuery<any[]>(
    ['happy-hours', 'progressive'],
    'venue_happy_hours',
    async () => {
      if (loadedVenues.length === 0) return [];
      
      const venueIds = loadedVenues.slice(0, 100).map(v => v.id); // Even more selective
      const { data, error } = await supabase
        .from('venue_happy_hours')
        .select('*')
        .in('venue_id', venueIds);
      
      if (error) throw error;
      return data || [];
    },
    'LOW', // Lower priority
    300000,
    loadedVenues.length > 0
  );

  const { data: dailySpecials = [] } = useOptimizedSupabaseQuery<any[]>(
    ['daily-specials', 'progressive'],
    'venue_daily_specials',
    async () => {
      if (loadedVenues.length === 0) return [];
      
      const venueIds = loadedVenues.slice(0, 100).map(v => v.id);
      const { data, error } = await supabase
        .from('venue_daily_specials')
        .select('*')
        .in('venue_id', venueIds);
      
      if (error) throw error;
      return data || [];
    },
    'LOW',
    300000,
    loadedVenues.length > 0
  );

  const { data: events = [] } = useOptimizedSupabaseQuery<any[]>(
    ['events', 'progressive'],
    'venue_events',
    async () => {
      if (loadedVenues.length === 0) return [];
      
      const venueIds = loadedVenues.slice(0, 100).map(v => v.id);
      const { data, error } = await supabase
        .from('venue_events')
        .select('*')
        .in('venue_id', venueIds);
      
      if (error) throw error;
      return data || [];
    },
    'LOW',
    300000,
    loadedVenues.length > 0
  );

  // Load breweries data
  const { data: breweries = [] } = useOptimizedSupabaseQuery<Brewery[]>(
    ['breweries', 'progressive'],
    'breweries',
    async () => {
      const { data, error } = await supabase
        .from('breweries')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    'NORMAL',
    300000
  );

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
    loadedVenues, 
    venueHoursMap, 
    venueHappyHoursMap, 
    venueDailySpecialsMap, 
    venueEventsMap,
    breweriesMap
  );
  
  return {
    venues: filteredVenues,
    allVenues: loadedVenues,
    error,
    isLoading,
    isLoadingMore,
    hasMoreVenues,
    loadMoreVenues,
    totalVenueCount,
    loadingProgress: totalVenueCount ? (loadedVenues.length / totalVenueCount) * 100 : 0,
    refetch,
    selectedVenue,
    setSelectedVenue,
    activeFilters,
    handleFilterChange,
    lastFilterUpdateTime
  };
}
