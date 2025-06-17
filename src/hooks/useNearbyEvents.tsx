
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VenueEvent } from '@/hooks/useVenueEvents';

export function useNearbyEvents(venueIds: string[], page = 1, pageSize = 12) {
  return useQuery({
    queryKey: ['nearbyEvents', venueIds, page, pageSize],
    queryFn: async () => {
      if (!venueIds.length) return { events: [], totalCount: 0, hasMore: false };
      
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await supabase
        .from('venue_events')
        .select('*', { count: 'exact' })
        .in('venue_id', venueIds)
        .gte('start_time', new Date().toISOString()) // Only upcoming events
        .order('start_time', { ascending: true })
        .range(from, to);
      
      if (error) throw error;
      
      return {
        events: data as VenueEvent[],
        totalCount: count || 0,
        hasMore: (count || 0) > to + 1
      };
    },
    enabled: venueIds.length > 0,
  });
}
