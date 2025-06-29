
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useInvalidationManager } from '@/contexts/InvalidationContext';
import { queryKeys } from '@/utils/queryKeys';
import type { Brewery } from '@/types/brewery';

export const useRealtimeBrewery = (breweryId: string | null, onBreweryUpdate?: (brewery: Brewery) => void) => {
  const { subscribe, unsubscribe } = useRealtime();
  const queryClient = useQueryClient();
  const invalidationManager = useInvalidationManager();
  const subscriptionIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!breweryId) return;

    console.log(`Setting up real-time subscriptions for brewery: ${breweryId}`);

    // Subscribe to brewery updates
    const brewerySubId = subscribe(
      'brewery_updated',
      (payload) => {
        console.log('Brewery updated:', payload);
        
        if (payload.new) {
          // Direct cache update instead of invalidation
          invalidationManager.updateQueryData(
            queryKeys.breweries.byId(breweryId),
            (old: Brewery | undefined) => payload.new as Brewery
          );
          
          // Update the brewery list cache if it exists
          queryClient.setQueryData(queryKeys.breweries.all, (old: Brewery[] | undefined) => {
            if (!old) return old;
            return old.map(brewery => 
              brewery.id === breweryId ? payload.new as Brewery : brewery
            );
          });

          if (onBreweryUpdate) {
            onBreweryUpdate(payload.new as Brewery);
          }
        } else {
          // Fallback to smart invalidation
          invalidationManager.invalidateByEntity('brewery', breweryId, 'update');
        }
      },
      { id: breweryId }
    );

    // Subscribe to brewery owners updates
    const ownersSubId = subscribe(
      'brewery_owners_updated',
      (payload) => {
        console.log('Brewery owners updated:', payload);
        // Only invalidate specific brewery data, not all breweries
        invalidationManager.invalidateQueries(queryKeys.breweries.byId(breweryId));
      },
      { brewery_id: breweryId }
    );

    subscriptionIdsRef.current = [brewerySubId, ownersSubId];

    return () => {
      console.log(`Cleaning up real-time subscriptions for brewery: ${breweryId}`);
      subscriptionIdsRef.current.forEach(id => unsubscribe(id));
      subscriptionIdsRef.current = [];
    };
  }, [breweryId, subscribe, unsubscribe, queryClient, onBreweryUpdate, invalidationManager]);
};
