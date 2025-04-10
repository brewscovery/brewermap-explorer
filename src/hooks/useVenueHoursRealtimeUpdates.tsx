
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVenueHoursRealtimeUpdates = (venueId: string | null = null) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  useEffect(() => {
    if (!venueId) return; // Only set up subscription if we have a venueId
    
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
          console.log(`Venue hours changed for venue ${venueId}, payload:`, payload);
          
          // First, invalidate to mark the query as stale
          queryClient.invalidateQueries({ 
            queryKey: ['venueHours', venueId]
          });
          
          // Then force an immediate refetch for the latest data
          queryClient.refetchQueries({ 
            queryKey: ['venueHours', venueId],
            exact: true,
            type: 'active', // Only refetch active queries
            stale: true // Only refetch stale queries
          });
        }
      )
      .subscribe((status) => {
        console.log(`Venue hours channel subscription status:`, status);
      });

    // Store channel reference for cleanup
    channelRef.current = hoursChannel;

    return () => {
      console.log(`Cleaning up venue hours subscription for venue ${venueId}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient, venueId]);
};
