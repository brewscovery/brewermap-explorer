
import { useOptimizedSupabaseQuery } from './useOptimizedSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';

interface BrewerySummaryData {
  venues: Venue[];
  country: string;
}

export function useBrewerySummary(breweryId: string | null) {
  return useOptimizedSupabaseQuery<BrewerySummaryData | null>(
    ['brewerySummary', breweryId],
    'venues',
    async () => {
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
    'NORMAL',
    300000, // 5 minutes stale time
    !!breweryId
  );
}
