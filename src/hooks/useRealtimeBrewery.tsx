
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
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced update function to prevent rapid successive updates
  const debouncedUpdate = (updateFn: () => void, delay = 300) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(updateFn, delay);
  };

  // Smart cache update that checks if data actually changed
  const updateBreweryCache = (newBrewery: Brewery, changeType: 'update' | 'create' | 'delete' = 'update') => {
    const breweryQueryKey = queryKeys.breweries.byId(breweryId!);
    
    // Get current cached data
    const currentBrewery = queryClient.getQueryData<Brewery>(breweryQueryKey);
    
    // Check if the data actually changed (deep comparison of relevant fields)
    if (currentBrewery && changeType === 'update') {
      const fieldsToCompare = ['name', 'about', 'logo_url', 'is_verified', 'updated_at'];
      const hasChanged = fieldsToCompare.some(field => 
        currentBrewery[field as keyof Brewery] !== newBrewery[field as keyof Brewery]
      );
      
      if (!hasChanged) {
        console.log('Brewery data unchanged, skipping cache update');
        return;
      }
    }

    // Direct cache update for individual brewery
    queryClient.setQueryData(breweryQueryKey, newBrewery);
    console.log(`[Smart Update] Direct cache update for brewery: ${newBrewery.name}`);

    // Update brewery list cache if it exists
    queryClient.setQueryData(queryKeys.breweries.all, (old: Brewery[] | undefined) => {
      if (!old) return old;
      
      if (changeType === 'delete') {
        return old.filter(brewery => brewery.id !== breweryId);
      }
      
      const exists = old.some(brewery => brewery.id === breweryId);
      if (exists) {
        return old.map(brewery => 
          brewery.id === breweryId ? newBrewery : brewery
        );
      } else if (changeType === 'create') {
        return [newBrewery, ...old];
      }
      
      return old;
    });

    // Only invalidate related queries if necessary
    if (changeType === 'update') {
      // Selectively invalidate only stats and summary queries
      invalidationManager.invalidateQueries(queryKeys.breweries.stats(breweryId!), { exact: true });
    } else {
      // For create/delete, use broader invalidation
      invalidationManager.invalidateByEntity('brewery', breweryId!, changeType);
    }

    if (onBreweryUpdate) {
      onBreweryUpdate(newBrewery);
    }
  };

  useEffect(() => {
    if (!breweryId) return;

    console.log(`Setting up smart real-time subscriptions for brewery: ${breweryId}`);

    // Subscribe to brewery updates with smart caching
    const brewerySubId = subscribe(
      'brewery_updated',
      (payload) => {
        console.log('Brewery updated payload:', payload);
        
        if (payload.new && payload.eventType !== 'DELETE') {
          debouncedUpdate(() => {
            updateBreweryCache(payload.new as Brewery, payload.eventType === 'INSERT' ? 'create' : 'update');
          });
        } else if (payload.eventType === 'DELETE') {
          debouncedUpdate(() => {
            updateBreweryCache(payload.old as Brewery, 'delete');
          });
        } else {
          // Fallback to invalidation if no data provided
          console.log('No brewery data in payload, falling back to invalidation');
          invalidationManager.invalidateByEntity('brewery', breweryId, 'update');
        }
      },
      { id: breweryId }
    );

    // Subscribe to brewery owners updates with selective invalidation
    const ownersSubId = subscribe(
      'brewery_owners_updated',
      (payload) => {
        console.log('Brewery owners updated:', payload);
        
        // Only invalidate specific brewery data, not all breweries
        debouncedUpdate(() => {
          invalidationManager.invalidateQueries(queryKeys.breweries.byId(breweryId), { exact: true });
        }, 100); // Shorter delay for ownership changes
      },
      { brewery_id: breweryId }
    );

    subscriptionIdsRef.current = [brewerySubId, ownersSubId];

    return () => {
      console.log(`Cleaning up smart real-time subscriptions for brewery: ${breweryId}`);
      subscriptionIdsRef.current.forEach(id => unsubscribe(id));
      subscriptionIdsRef.current = [];
      
      // Clear any pending updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, [breweryId, subscribe, unsubscribe, queryClient, onBreweryUpdate, invalidationManager]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);
};
