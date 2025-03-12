
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';
import { toast } from 'sonner';

export const useVenueData = (initialSearchTerm = '', initialSearchType: 'name' | 'city' | 'country' = 'name') => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchType, setSearchType] = useState<'name' | 'city' | 'country'>(initialSearchType);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const queryClient = useQueryClient();

  const { data: venues = [], isLoading, error, refetch } = useQuery({
    queryKey: ['venues', searchTerm, searchType],
    queryFn: async () => {
      if (!searchTerm) {
        const { data, error } = await supabase
          .from('venues')
          .select('*');

        if (error) throw error;
        return data || [];
      }

      if (searchType === 'city') {
        const { data, error } = await supabase.functions.invoke('geocode-city', {
          body: { city: searchTerm }
        });

        if (error) throw error;
        return data || [];
      }

      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .filter(
          searchType === 'name' 
            ? 'name' 
            : 'country',
          'ilike',
          `%${searchTerm}%`
        );

      if (error) throw error;
      return data || [];
    }
  });

  // Subscribe to realtime changes on venues table
  useEffect(() => {
    console.log('Setting up realtime subscription for venues');
    
    const channel = supabase
      .channel('venues-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'venues'
        },
        (payload) => {
          console.log('Venue change detected:', payload);
          // Invalidate and refetch venues data when changes occur
          queryClient.invalidateQueries({ queryKey: ['venues'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateSearch = (newTerm: string, newType: 'name' | 'city' | 'country') => {
    setSearchTerm(newTerm);
    setSearchType(newType);
  };

  return {
    venues,
    isLoading,
    error,
    refetch,
    selectedVenue,
    setSelectedVenue,
    searchTerm,
    searchType,
    updateSearch
  };
};
