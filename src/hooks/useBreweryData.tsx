
import { useState } from 'react';
import { useOptimizedSupabaseQuery } from './useOptimizedSupabaseQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useInvalidationManager } from '@/contexts/InvalidationContext';
import { queryKeys } from '@/utils/queryKeys';
import { supabase } from '@/integrations/supabase/client';
import type { Brewery } from '@/types/brewery';
import { toast } from 'sonner';

export const useBreweryData = (initialSearchTerm = '', initialSearchType: 'name' | 'city' | 'country' = 'name') => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchType, setSearchType] = useState<'name' | 'city' | 'country'>(initialSearchType);
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const queryClient = useQueryClient();
  const invalidationManager = useInvalidationManager();

  const { data: breweries = [], isLoading, error, refetch } = useOptimizedSupabaseQuery<Brewery[]>(
    queryKeys.breweries.bySearch(searchTerm, searchType),
    'breweries',
    async () => {
      if (!searchTerm) {
        const { data, error } = await supabase
          .from('breweries')
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
        .from('breweries')
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
    },
    'NORMAL',
    30000 // 30 seconds stale time
  );

  const updateSearch = (newTerm: string, newType: 'name' | 'city' | 'country') => {
    setSearchTerm(newTerm);
    setSearchType(newType);
  };

  return {
    breweries,
    isLoading,
    error,
    refetch,
    selectedBrewery,
    setSelectedBrewery,
    searchTerm,
    searchType,
    updateSearch
  };
};
