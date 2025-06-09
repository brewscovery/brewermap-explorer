
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVenueHoursRealtimeUpdates = (venueId: string | null = null) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Skip if we don't have a venueId or if we've already set up the subscription
    if (!venueId || hasRunRef.current) return;
    
    console.log(`Setting up realtime subscription for venue hours (venueId: ${venueId})`);
    
    const hoursChannel = supabase
      .channel('venue-hours-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'venue_hours',
          filter: venueId ? `venue_id=eq.${venueId}` : undefined
        },
        (payload) => {
          // If venue hours change, invalidate the specific venue hours query
          const payloadVenueId = 
            (payload.new && typeof payload.new === 'object' && 'venue_id' in payload.new) ? payload.new.venue_id :
            (payload.old && typeof payload.old === 'object' && 'venue_id' in payload.old) ? payload.old.venue_id :
            null;
            
          if (payloadVenueId) {
            console.log(`Venue hours changed for venue ${payloadVenueId}, invalidating query`);
            queryClient.invalidateQueries({ 
              queryKey: ['venueHours', payloadVenueId]
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`Venue hours channel subscription status:`, status);
        hasRunRef.current = true;
      });

    // Store channel reference for cleanup
    channelRef.current = hoursChannel;

    // Cleanup function
    return () => {
      // Only clean up if we're changing venues or unmounting completely
      if (venueId) { 
        console.log(`Cleaning up venue hours subscription for venue ${venueId}`);
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          hasRunRef.current = false;
        }
      }
    };
  }, [queryClient, venueId]); // Keep these as the only dependencies
};
