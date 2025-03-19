
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Brewery } from '@/types/brewery';

export const useBreweryRealtimeUpdates = (
  selectedBrewery: Brewery | null,
  setSelectedBrewery: (brewery: Brewery | null) => void
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up realtime subscription for breweries');
    
    // Create a single channel for all brewery-related changes to make it more efficient
    const breweryChangesChannel = supabase
      .channel('brewery-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'breweries'
        },
        (payload) => {
          console.log('Brewery data change detected:', payload);
          
          // Handle different types of events
          if (payload.eventType === 'INSERT') {
            console.log('New brewery created:', payload.new);
            // Invalidate the breweries list query
            queryClient.invalidateQueries({ queryKey: ['breweries'] });
          } 
          else if (payload.eventType === 'UPDATE') {
            console.log('Brewery updated:', payload.new);
            
            // If this is the currently selected brewery, update it directly
            if (selectedBrewery && payload.new && typeof payload.new === 'object' && 'id' in payload.new && 
                selectedBrewery.id === payload.new.id) {
              console.log('Directly updating selected brewery with real-time data:', payload.new);
              setSelectedBrewery(payload.new as Brewery);
            }
            
            // Invalidate both the collection and the specific item
            queryClient.invalidateQueries({ queryKey: ['breweries'] });
            
            if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
              console.log('Invalidating query for specific brewery:', payload.new.id);
              queryClient.invalidateQueries({ 
                queryKey: ['brewery', payload.new.id]
              });
              
              // Also invalidate brewery stats
              queryClient.invalidateQueries({
                queryKey: ['brewery-stats', payload.new.id]
              });
            }
          }
          else if (payload.eventType === 'DELETE') {
            console.log('Brewery deleted:', payload.old);
            
            // If this is the currently selected brewery, deselect it
            if (selectedBrewery && payload.old && typeof payload.old === 'object' && 'id' in payload.old && 
                selectedBrewery.id === payload.old.id) {
              console.log('Selected brewery was deleted, deselecting it');
              setSelectedBrewery(null);
            }
            
            // Invalidate the breweries list query
            queryClient.invalidateQueries({ queryKey: ['breweries'] });
            
            if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
              // Remove the specific brewery from the cache
              queryClient.removeQueries({ queryKey: ['brewery', payload.old.id] });
              queryClient.removeQueries({ queryKey: ['brewery-stats', payload.old.id] });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to changes in the brewery_owners table (separate channel)
    const ownersChannel = supabase
      .channel('brewery-owners-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'brewery_owners'
        },
        (payload) => {
          console.log('Brewery ownership change detected:', payload);
          
          // Invalidate broader queries that might be affected by ownership changes
          queryClient.invalidateQueries({ queryKey: ['breweries'] });
          
          if (payload.new && typeof payload.new === 'object' && 'brewery_id' in payload.new) {
            console.log('Invalidating query for brewery in ownership change:', payload.new.brewery_id);
            queryClient.invalidateQueries({
              queryKey: ['brewery', payload.new.brewery_id]
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscriptions for breweries');
      supabase.removeChannel(breweryChangesChannel);
      supabase.removeChannel(ownersChannel);
    };
  }, [queryClient, selectedBrewery, setSelectedBrewery]);
};
