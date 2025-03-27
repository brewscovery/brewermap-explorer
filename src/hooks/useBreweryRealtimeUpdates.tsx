
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Brewery } from '@/types/brewery';

export const useBreweryRealtimeUpdates = (
  selectedBrewery: Brewery | null,
  setSelectedBrewery: (brewery: Brewery | null) => void,
  breweries?: Brewery[],
  setBreweries?: (breweries: Brewery[]) => void
) => {
  const queryClient = useQueryClient();
  const breweryChannelRef = useRef(null);
  const ownersChannelRef = useRef(null);

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
            // Only invalidate queries, don't directly update them
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
            
            // If we have access to the breweries array and the setBreweries function, update it directly
            if (breweries && setBreweries && payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
              const updatedBrewery = payload.new as Brewery;
              const updatedBreweries = breweries.map(brewery => 
                brewery.id === updatedBrewery.id ? updatedBrewery : brewery
              );
              console.log('Directly updating breweries array with real-time data');
              setBreweries(updatedBreweries);
            }
            
            // Just invalidate, don't update the cache directly
            queryClient.invalidateQueries({ queryKey: ['breweries'] });
            
            if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
              console.log('Invalidating query for specific brewery:', payload.new.id);
              queryClient.invalidateQueries({ 
                queryKey: ['brewery', payload.new.id]
              });
              
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
            
            // If we have access to the breweries array and the setBreweries function, update it directly
            if (breweries && setBreweries && payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
              const deletedBreweryId = payload.old.id;
              const updatedBreweries = breweries.filter(brewery => brewery.id !== deletedBreweryId);
              console.log('Directly updating breweries array after deletion');
              setBreweries(updatedBreweries);
            }
            
            queryClient.invalidateQueries({ queryKey: ['breweries'] });
            
            if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
              queryClient.removeQueries({ queryKey: ['brewery', payload.old.id] });
              queryClient.removeQueries({ queryKey: ['brewery-stats', payload.old.id] });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Brewery channel subscription status:', status);
      });
      
    // Store channel reference for cleanup
    breweryChannelRef.current = breweryChangesChannel;

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
          
          // Only invalidate, don't update
          queryClient.invalidateQueries({ queryKey: ['breweries'] });
          
          if (payload.new && typeof payload.new === 'object' && 'brewery_id' in payload.new) {
            console.log('Invalidating query for brewery in ownership change:', payload.new.brewery_id);
            queryClient.invalidateQueries({
              queryKey: ['brewery', payload.new.brewery_id]
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Brewery owners channel subscription status:', status);
      });
      
    // Store channel reference for cleanup
    ownersChannelRef.current = ownersChannel;

    return () => {
      console.log('Cleaning up realtime subscriptions for breweries');
      if (breweryChannelRef.current) {
        supabase.removeChannel(breweryChannelRef.current);
        breweryChannelRef.current = null;
      }
      if (ownersChannelRef.current) {
        supabase.removeChannel(ownersChannelRef.current);
        ownersChannelRef.current = null;
      }
    };
  }, [queryClient, selectedBrewery, setSelectedBrewery, breweries, setBreweries]);
};
