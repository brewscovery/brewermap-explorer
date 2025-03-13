
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBreweryRealtimeUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up realtime subscription for breweries');
    
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
            queryClient.invalidateQueries({ 
              queryKey: ['brewery', payload.new.id]
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription for breweries');
      supabase.removeChannel(breweryChannel);
    };
  }, [queryClient]);
};
