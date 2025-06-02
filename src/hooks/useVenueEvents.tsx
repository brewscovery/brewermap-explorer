import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotificationService } from '@/services/NotificationService';
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
  ticket_price: number | null;
  ticket_url: string | null;
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

export function useMultipleVenueEvents(venueIds: string[]) {
  return useQuery({
    queryKey: ['multipleVenueEvents', venueIds],
    queryFn: async () => {
      if (!venueIds.length) return [];
      const { data, error } = await supabase
        .from('venue_events')
        .select('*')
        .in('venue_id', venueIds)
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data as VenueEvent[];
    },
    enabled: venueIds.length > 0,
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['venueEvents', data.venue_id] });
      queryClient.invalidateQueries({ queryKey: ['multipleVenueEvents'] });

      // Send event creation notification
      try {
        console.log('🏢 Fetching venue name for event notification:', data.venue_id);
        const { data: venue, error: venueError } = await supabase
          .from('venues')
          .select('name')
          .eq('id', data.venue_id)
          .single();

        if (venueError) {
          console.error('❌ Error fetching venue name:', venueError);
        } else if (venue?.name) {
          console.log('🏢 Venue name found:', venue.name);
          const content = `New event "${data.title}" has been created at ${venue.name}!`;
          await NotificationService.notifyEventUpdate(data.id, data.venue_id, 'EVENT_CREATED', content);
          console.log('Event creation notifications sent');
        }
      } catch (notificationError) {
        console.error('Error sending event creation notifications:', notificationError);
        // Don't fail the whole operation for notification errors
      }
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['venueEvents', data.venue_id] });
      queryClient.invalidateQueries({ queryKey: ['multipleVenueEvents'] });

      // Send event update notification
      try {
        console.log('🏢 Fetching venue name for event update notification:', data.venue_id);
        const { data: venue, error: venueError } = await supabase
          .from('venues')
          .select('name')
          .eq('id', data.venue_id)
          .single();

        if (venueError) {
          console.error('❌ Error fetching venue name:', venueError);
        } else if (venue?.name) {
          console.log('🏢 Venue name found:', venue.name);
          const content = `Event "${data.title}" at ${venue.name} has been updated!`;
          await NotificationService.notifyEventUpdate(data.id, data.venue_id, 'EVENT_UPDATED', content);
          console.log('Event update notifications sent');
        }
      } catch (notificationError) {
        console.error('Error sending event update notifications:', notificationError);
        // Don't fail the whole operation for notification errors
      }
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
      queryClient.invalidateQueries({ queryKey: ['multipleVenueEvents'] });
    }
  });
}
