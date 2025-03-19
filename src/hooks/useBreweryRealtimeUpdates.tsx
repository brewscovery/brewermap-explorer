
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBreweryRealtimeUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up realtime subscription for breweries');
    
    // Subscribe to changes in the breweries table
    const breweryChannel = supabase
      .channel('breweries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'breweries'
        },
        (payload) => {
          console.log('Brewery change detected:', payload);
          
          // Invalidate any queries that might contain brewery data
          queryClient.invalidateQueries({ queryKey: ['breweries'] });
          
          // If a specific brewery was changed, invalidate its data
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
      )
      .subscribe();

    // Subscribe to changes in the brewery_owners table
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
      supabase.removeChannel(breweryChannel);
      supabase.removeChannel(ownersChannel);
    };
  }, [queryClient]);
};
