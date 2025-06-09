
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';

export const useVenueRealtimeUpdates = (selectedVenue: Venue | null, setSelectedVenue: (venue: Venue | null) => void) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  useEffect(() => {
    console.log('Setting up realtime subscription for venues');
    
    // Create a channel for all venue-related changes
    const channel = supabase
      .channel('venues-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'venues'
        },
        (payload) => {
          console.log('Venue change detected:', payload);
          
          // Handle the specific type of change
          if (payload.eventType === 'INSERT') {
            console.log('New venue added:', payload.new);
            // Invalidate all venue queries to ensure all views update
            queryClient.invalidateQueries({ queryKey: ['venues'] });
            
            // Also invalidate any specific brewery venue queries
            if (payload.new && typeof payload.new === 'object' && 'brewery_id' in payload.new) {
              queryClient.invalidateQueries({ 
                queryKey: ['breweryVenues', payload.new.brewery_id] 
              });
            }
          } 
          else if (payload.eventType === 'UPDATE') {
            console.log('Venue updated:', payload.new);
            
            // Invalidate general venue queries
            queryClient.invalidateQueries({ queryKey: ['venues'] });
            
            // If this is the currently selected venue, update it
            if (selectedVenue && payload.new && typeof payload.new === 'object' && 'id' in payload.new && 
                selectedVenue.id === payload.new.id) {
              setSelectedVenue(payload.new as Venue);
            }
            
            // Also invalidate specific brewery venue queries
            if (payload.new && typeof payload.new === 'object' && 'brewery_id' in payload.new) {
              queryClient.invalidateQueries({ 
                queryKey: ['breweryVenues', payload.new.brewery_id] 
              });
            }
          }
          else if (payload.eventType === 'DELETE') {
            console.log('Venue deleted:', payload.old);
            
            // Invalidate all venue queries
            queryClient.invalidateQueries({ queryKey: ['venues'] });
            
            // If this is the currently selected venue, deselect it
            if (selectedVenue && payload.old && typeof payload.old === 'object' && 'id' in payload.old && 
                selectedVenue.id === payload.old.id) {
              setSelectedVenue(null);
            }
            
            // Also invalidate specific brewery venue queries
            if (payload.old && typeof payload.old === 'object' && 'brewery_id' in payload.old) {
              queryClient.invalidateQueries({ 
                queryKey: ['breweryVenues', payload.old.brewery_id] 
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Venue channel subscription status:', status);
      });
      
    // Store the channel in the ref for cleanup
    channelRef.current = channel;

    return () => {
      console.log('Cleaning up realtime subscription for venues');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [queryClient, selectedVenue, setSelectedVenue]);
};
