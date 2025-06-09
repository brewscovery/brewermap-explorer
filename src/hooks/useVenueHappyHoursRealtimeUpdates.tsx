
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVenueHappyHoursRealtimeUpdates = (venueId: string | null = null) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  useEffect(() => {
    if (!venueId) return; // Only set up subscription if we have a venueId
    
    console.log(`Setting up realtime subscription for venue happy hours (venueId: ${venueId})`);
    
    const happyHoursChannel = supabase
      .channel('venue-happy-hours-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'venue_happy_hours',
          filter: venueId ? `venue_id=eq.${venueId}` : undefined
        },
        (payload) => {
          // If venue happy hours change, invalidate the specific venue happy hours query
          const payloadVenueId = 
            (payload.new && typeof payload.new === 'object' && 'venue_id' in payload.new) ? payload.new.venue_id :
            (payload.old && typeof payload.old === 'object' && 'venue_id' in payload.old) ? payload.old.venue_id :
            null;
            
          if (payloadVenueId) {
            console.log(`Venue happy hours changed for venue ${payloadVenueId}, invalidating query`);
            queryClient.invalidateQueries({ 
              queryKey: ['venueHappyHours', payloadVenueId]
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`Venue happy hours channel subscription status:`, status);
      });

    // Store channel reference for cleanup
    channelRef.current = happyHoursChannel;

    return () => {
      console.log(`Cleaning up venue happy hours subscription for venue ${venueId}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient, venueId]);
};
