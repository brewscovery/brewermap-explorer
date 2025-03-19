
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Brewery } from '@/types/brewery';
import { toast } from 'sonner';

export const useBreweryData = (initialSearchTerm = '', initialSearchType: 'name' | 'city' | 'country' = 'name') => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchType, setSearchType] = useState<'name' | 'city' | 'country'>(initialSearchType);
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const queryClient = useQueryClient();

  const { data: breweries = [], isLoading, error, refetch } = useQuery({
    queryKey: ['breweries', searchTerm, searchType],
    queryFn: async () => {
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
    // Ensure we're not caching this data for too long
    staleTime: 1000 * 60, // 1 minute
  });

  // Update the selected brewery if it's in the new data
  if (selectedBrewery && breweries) {
    const updatedBrewery = breweries.find(b => b.id === selectedBrewery.id);
    if (updatedBrewery && JSON.stringify(updatedBrewery) !== JSON.stringify(selectedBrewery)) {
      console.log('Updating selected brewery in useBreweryData:', updatedBrewery);
      setSelectedBrewery(updatedBrewery);
    }
  }

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
