import { useState, useEffect, useMemo } from 'react';
import { useOptimizedSupabaseQuery } from './useOptimizedSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useVenueFilters } from './useVenueFilters';
import { pwaCache } from '@/utils/pwaCache';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';

interface BasicVenue {
  id: string;
  name: string;
  latitude: string | null;
  longitude: string | null;
  city: string;
  state: string;
  brewery_id: string;
}

interface ProgressiveVenueData {
  venues: Venue[];
  allVenues: Venue[];
  error: any;
  isLoading: boolean;
  isLoadingDetails: boolean;
  refetch: () => void;
  selectedVenue: Venue | null;
  setSelectedVenue: (venue: Venue | null) => void;
  activeFilters: string[];
  handleFilterChange: (filters: string[]) => void;
  lastFilterUpdateTime: number;
}

export function useProgressiveVenueData(): ProgressiveVenueData {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isDetailsLoaded, setIsDetailsLoaded] = useState(false);
  const [cachedVenues, setCachedVenues] = useState<Venue[]>([]);
  const [hasCacheLoaded, setHasCacheLoaded] = useState(false);

  // Load cached venues immediately on mount
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cached = await pwaCache.getVenues();
        if (cached && cached.length > 0) {
          console.log(`Loaded ${cached.length} venues from cache`);
          setCachedVenues(cached);
        }
      } catch (error) {
        console.error('Error loading cached venues:', error);
      } finally {
        setHasCacheLoaded(true);
      }
    };

    loadCachedData();
  }, []);

  // Phase 1: Load basic venue data immediately (only coordinates and essential info)
  const { data: basicVenues = [], error, isLoading, refetch } = useOptimizedSupabaseQuery<BasicVenue[]>(
    ['venues-basic'],
    'venues',
    async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, latitude, longitude, city, state, brewery_id')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      
      if (error) throw error;
      
      // Cache the basic venue data for offline use
      if (data && data.length > 0) {
        try {
          const venuesForCache = data.map((basicVenue): Venue => ({
            ...basicVenue,
            street: null,
            postal_code: null,
            country: null,
            phone: null,
            website_url: null,
            created_at: '',
            updated_at: ''
          }));
          await pwaCache.setVenues(venuesForCache);
          console.log(`Cached ${data.length} venues for offline use`);
        } catch (cacheError) {
          console.error('Error caching venues:', cacheError);
        }
      }
      
      return data || [];
    },
    'CRITICAL',
    60000, // 1 minute stale time for basic data
    hasCacheLoaded // Only fetch after checking cache
  );

  // Phase 2: Load complete venue data progressively
  const { data: completeVenues = [], isLoading: isLoadingComplete } = useOptimizedSupabaseQuery<Venue[]>(
    ['venues-complete'],
    'venues',
    async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    'NORMAL',
    300000, // 5 minutes stale time
    basicVenues.length > 0 // Only load after basic venues are loaded
  );

  // Phase 3: Load supplementary data (hours, specials, etc.) - lazy loaded
  const { data: venueHours = [] } = useOptimizedSupabaseQuery<any[]>(
    ['venue-hours'],
    'venue_hours',
    async () => {
      const { data, error } = await supabase
        .from('venue_hours')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    'LOW',
    600000, // 10 minutes stale time
    isDetailsLoaded // Only load when details are needed
  );

  const { data: happyHours = [] } = useOptimizedSupabaseQuery<any[]>(
    ['happy-hours'],
    'venue_happy_hours',
    async () => {
      const { data, error } = await supabase
        .from('venue_happy_hours')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    'LOW',
    600000,
    isDetailsLoaded
  );

  const { data: dailySpecials = [] } = useOptimizedSupabaseQuery<any[]>(
    ['daily-specials'],
    'venue_daily_specials',
    async () => {
      const { data, error } = await supabase
        .from('venue_daily_specials')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    'LOW',
    600000,
    isDetailsLoaded
  );

  const { data: events = [] } = useOptimizedSupabaseQuery<any[]>(
    ['events'],
    'venue_events',
    async () => {
      const { data, error } = await supabase
        .from('venue_events')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    'LOW',
    600000,
    isDetailsLoaded
  );

  const { data: breweries = [] } = useOptimizedSupabaseQuery<Brewery[]>(
    ['breweries'],
    'breweries',
    async () => {
      const { data, error } = await supabase
        .from('breweries')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    'LOW',
    600000,
    isDetailsLoaded
  );

  // Use the best available data source: complete > basic > cached
  const venues = useMemo(() => {
    if (completeVenues.length > 0) {
      return completeVenues;
    }
    
    if (basicVenues.length > 0) {
      // Convert basic venues to full venue objects with default values
      return basicVenues.map((basicVenue): Venue => ({
        ...basicVenue,
        street: null,
        postal_code: null,
        country: null,
        phone: null,
        website_url: null,
        created_at: '',
        updated_at: ''
      }));
    }
    
    // Fall back to cached venues for immediate display
    return cachedVenues;
  }, [completeVenues, basicVenues, cachedVenues]);

  // Trigger detail loading when user interacts with filters or selects venue
  useEffect(() => {
    if (!isDetailsLoaded && (selectedVenue || venues.length > 0)) {
      const timer = setTimeout(() => {
        setIsDetailsLoaded(true);
      }, 500); // Small delay to prioritize map rendering
      
      return () => clearTimeout(timer);
    }
  }, [selectedVenue, venues.length, isDetailsLoaded]);

  // Process and organize the supplementary data
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

  // Use the venue filters hook with the current data state
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
  
  // Debug logging for loading state
  const finalIsLoading = !hasCacheLoaded || (isLoading && !cachedVenues.length);
  console.log('Progressive venue data state:', {
    hasCacheLoaded,
    isLoading,
    cachedVenuesLength: cachedVenues.length,
    basicVenuesLength: basicVenues.length,
    finalIsLoading,
    venuesLength: venues.length
  });

  return {
    venues: filteredVenues,
    allVenues: venues,
    error,
    isLoading: finalIsLoading,
    isLoadingDetails: isLoadingComplete,
    refetch,
    selectedVenue,
    setSelectedVenue,
    activeFilters,
    handleFilterChange,
    lastFilterUpdateTime
  };
}