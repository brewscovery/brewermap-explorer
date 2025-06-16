
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { VenueEvent } from './useVenueEvents';

interface PastEventsResponse {
  events: VenueEvent[];
  totalCount: number;
  hasMore: boolean;
}

export function usePastInterestedEvents(page = 1, pageSize = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pastInterestedEvents', user?.id, page, pageSize],
    queryFn: async (): Promise<PastEventsResponse> => {
      if (!user) return { events: [], totalCount: 0, hasMore: false };
      
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // First get the event IDs that the user is interested in
      const { data: interestData, error: interestError } = await supabase
        .from('event_interests')
        .select('event_id')
        .eq('user_id', user.id);
      
      if (interestError) throw interestError;
      
      const eventIds = interestData.map(item => item.event_id);
      
      if (eventIds.length === 0) {
        return { events: [], totalCount: 0, hasMore: false };
      }
      
      // Then fetch past events that the user was interested in
      const { data, error, count } = await supabase
        .from('venue_events')
        .select('*', { count: 'exact' })
        .in('id', eventIds)
        .lt('end_time', new Date().toISOString()) // Only past events
        .order('end_time', { ascending: false }) // Most recent first
        .range(from, to);
      
      if (error) throw error;
      
      return {
        events: data as VenueEvent[],
        totalCount: count || 0,
        hasMore: (count || 0) > to + 1
      };
    },
    enabled: !!user,
  });
}
