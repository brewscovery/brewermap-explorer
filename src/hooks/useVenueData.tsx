
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';
import { toast } from 'sonner';

export const useVenueData = (initialSearchTerm = '', initialSearchType: 'name' | 'city' | 'country' = 'name') => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchType, setSearchType] = useState<'name' | 'city' | 'country'>(initialSearchType);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

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
