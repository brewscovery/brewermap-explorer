
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVenueDailySpecialsRealtimeUpdates = (venueId: string | null = null) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  useEffect(() => {
    if (!venueId) return; // Only set up subscription if we have a venueId
    
    console.log(`Setting up realtime subscription for venue daily specials (venueId: ${venueId})`);
    
    const dailySpecialsChannel = supabase
      .channel('venue-daily-specials-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'venue_daily_specials',
          filter: venueId ? `venue_id=eq.${venueId}` : undefined
        },
        (payload) => {
          // If venue daily specials change, invalidate the specific venue daily specials query
          const payloadVenueId = 
            (payload.new && typeof payload.new === 'object' && 'venue_id' in payload.new) ? payload.new.venue_id :
            (payload.old && typeof payload.old === 'object' && 'venue_id' in payload.old) ? payload.old.venue_id :
            null;
            
          if (payloadVenueId) {
            console.log(`Venue daily specials changed for venue ${payloadVenueId}, invalidating query`);
            queryClient.invalidateQueries({ 
              queryKey: ['venueDailySpecials', payloadVenueId]
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`Venue daily specials channel subscription status:`, status);
      });

    // Store channel reference for cleanup
    channelRef.current = dailySpecialsChannel;

    return () => {
      console.log(`Cleaning up venue daily specials subscription for venue ${venueId}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient, venueId]);
};
