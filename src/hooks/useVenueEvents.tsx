
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';

export interface VenueEvent {
  id: string;
  venue_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  max_attendees: number | null;
  is_published: boolean;
}

export function useVenueEvents(venueId: string | null) {
  return useQuery({
    queryKey: ['venueEvents', venueId],
    queryFn: async () => {
      if (!venueId) return [];
      const { data, error } = await supabase
        .from('venue_events')
        .select('*')
        .eq('venue_id', venueId)
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data as VenueEvent[];
    },
    enabled: !!venueId,
  });
}

export function useCreateVenueEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventData: Omit<VenueEvent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('venue_events')
        .insert(eventData)
        .select()
        .single();
      if (error) throw error;
      return data as VenueEvent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['venueEvents', data.venue_id] });
    }
  });
}

export function useUpdateVenueEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...eventData }: Partial<VenueEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('venue_events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as VenueEvent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['venueEvents', data.venue_id] });
    }
  });
}

export function useDeleteVenueEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, venue_id }: { id: string, venue_id: string }) => {
      const { error } = await supabase
        .from('venue_events')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { id, venue_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['venueEvents', data.venue_id] });
    }
  });
}
