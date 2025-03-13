
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';

interface UseVenueSearchResult {
  venues: Venue[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  searchTerm: string;
  searchType: 'name' | 'city' | 'country';
  updateSearch: (newTerm: string, newType: 'name' | 'city' | 'country') => void;
}

export const useVenueSearch = (
  initialSearchTerm = '', 
  initialSearchType: 'name' | 'city' | 'country' = 'name'
): UseVenueSearchResult => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchType, setSearchType] = useState<'name' | 'city' | 'country'>(initialSearchType);

  const { 
    data: venues = [], 
    isLoading, 
    error, 
    refetch: originalRefetch 
  } = useQuery({
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

  const updateSearch = useCallback((newTerm: string, newType: 'name' | 'city' | 'country') => {
    setSearchTerm(newTerm);
    setSearchType(newType);
  }, []);

  const refetch = async () => {
    await originalRefetch();
  };

  return {
    venues,
    isLoading,
    error,
    refetch,
    searchTerm,
    searchType,
    updateSearch
  };
};
