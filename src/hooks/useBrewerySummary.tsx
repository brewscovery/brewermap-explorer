
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';

export function useBrewerySummary(breweryId: string | null) {
  return useQuery({
    queryKey: ['brewerySummary', breweryId],
    queryFn: async () => {
      if (!breweryId) return null;

      const { data: venues, error: venuesError } = await supabase
        .from('venues')
        .select('*')
        .eq('brewery_id', breweryId);

      if (venuesError) throw venuesError;

      const { data: brewery, error: breweryError } = await supabase
        .from('breweries')
        .select('country')
        .eq('id', breweryId)
        .single();

      if (breweryError) throw breweryError;

      return {
        venues: venues as Venue[],
        country: brewery.country
      };
    },
    enabled: !!breweryId
  });
}
