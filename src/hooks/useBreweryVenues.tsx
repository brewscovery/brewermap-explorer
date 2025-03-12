
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';
import { toast } from 'sonner';

export const useBreweryVenues = (breweryId: string | null) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const { 
    data: venues, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['breweryVenues', breweryId],
    queryFn: async () => {
      if (!breweryId) return [];
      
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('brewery_id', breweryId)
        .order('name');

      if (error) {
        console.error('Error fetching brewery venues:', error);
        toast.error('Failed to load venues');
        throw error;
      }
      
      return data as Venue[];
    },
    enabled: !!breweryId
  });

  return {
    venues: venues || [],
    isLoading,
    error,
    refetch,
    isDeleting
  };
};
