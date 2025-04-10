import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVenueHoursRealtimeUpdates = (venueId: string | null = null) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');

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
          
          // Force an immediate refetch
          queryClient.refetchQueries({ 
            queryKey: ['venueHours', venueId],
            exact: true,
            type: 'all' // Use 'all' to ensure we catch all queries
          });
          
          // Log current query cache state
          console.log('Current query cache state after update:', 
            queryClient.getQueryCache().find(['venueHours', venueId]));
        }
      )
      .on('disconnect', (event) => {
        console.log('Venue hours channel disconnected:', event);
        setConnectionStatus('DISCONNECTED');
      })
      .on('error', (error) => {
        console.error('Venue hours channel error:', error);
      })
      .subscribe((status) => {
        console.log(`Venue hours channel subscription status:`, status);
        setConnectionStatus(status);
      });

    // Store channel reference for cleanup
    channelRef.current = hoursChannel;

    // Set up a periodic ping to keep the connection alive
    const pingInterval = setInterval(() => {
      if (connectionStatus !== 'SUBSCRIBED') {
        console.log('Reconnecting venue hours subscription...');
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
        
        // Recreate the channel
        const newChannel = supabase
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
              console.log(`Venue hours changed (reconnected) for venue ${venueId}, payload:`, payload);
              queryClient.invalidateQueries({ queryKey: ['venueHours', venueId] });
              queryClient.refetchQueries({ 
                queryKey: ['venueHours', venueId],
                exact: true,
                type: 'all'
              });
            }
          )
          .subscribe();
          
        channelRef.current = newChannel;
      } else {
        console.log('Venue hours subscription is active:', connectionStatus);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      console.log(`Cleaning up venue hours subscription for venue ${venueId}`);
      clearInterval(pingInterval);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient, venueId, connectionStatus]);
};
