import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/contexts/RealtimeContext';
import type { Brewery } from '@/types/brewery';

export const useRealtimeBrewery = (breweryId: string | null, onBreweryUpdate?: (brewery: Brewery) => void) => {
  const { subscribe, unsubscribe } = useRealtime();
  const queryClient = useQueryClient();
  const subscriptionIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!breweryId) return;

    console.log(`Setting up real-time subscriptions for brewery: ${breweryId}`);

    // Subscribe to brewery updates
    const brewerySubId = subscribe(
      'brewery_updated',
      (payload) => {
        console.log('Brewery updated:', payload);
        queryClient.invalidateQueries({ queryKey: ['brewery', breweryId] });
        queryClient.invalidateQueries({ queryKey: ['breweries'] });
        
        if (onBreweryUpdate && payload.new) {
          onBreweryUpdate(payload.new as Brewery);
        }
      },
      { id: breweryId }
    );

    // Subscribe to brewery owners updates
    const ownersSubId = subscribe(
      'brewery_owners_updated',
      (payload) => {
        console.log('Brewery owners updated:', payload);
        queryClient.invalidateQueries({ queryKey: ['brewery', breweryId] });
        queryClient.invalidateQueries({ queryKey: ['breweries'] });
      },
      { brewery_id: breweryId }
    );

    subscriptionIdsRef.current = [brewerySubId, ownersSubId];

    return () => {
      console.log(`Cleaning up real-time subscriptions for brewery: ${breweryId}`);
      subscriptionIdsRef.current.forEach(id => unsubscribe(id));
      subscriptionIdsRef.current = [];
    };
  }, [breweryId, subscribe, unsubscribe, queryClient, onBreweryUpdate]);
};