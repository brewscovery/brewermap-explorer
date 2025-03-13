
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVenueHoursRealtimeUpdates = (venueId: string | null = null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up realtime subscription for venue hours');
    
    const hoursChannel = supabase
      .channel('venue-hours-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'venue_hours'
        },
        (payload) => {
          console.log('Venue hours change detected:', payload);
          
          // If venue hours change, invalidate the specific venue hours query
          const payloadVenueId = 
            (payload.new && typeof payload.new === 'object' && 'venue_id' in payload.new) ? payload.new.venue_id :
            (payload.old && typeof payload.old === 'object' && 'venue_id' in payload.old) ? payload.old.venue_id :
            null;
            
          // Only invalidate if we're watching all venues or if this is the specific venue we're watching
          if (payloadVenueId && (!venueId || payloadVenueId === venueId)) {
            queryClient.invalidateQueries({ 
              queryKey: ['venueHours', payloadVenueId]
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription for venue hours');
      supabase.removeChannel(hoursChannel);
    };
  }, [queryClient, venueId]);
};
