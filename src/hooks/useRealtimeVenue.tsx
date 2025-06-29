
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useInvalidationManager } from '@/contexts/InvalidationContext';
import { queryKeys } from '@/utils/queryKeys';
import type { Venue } from '@/types/venue';

export const useRealtimeVenue = (venueId: string | null, onVenueUpdate?: (venue: Venue) => void) => {
  const { subscribe, unsubscribe } = useRealtime();
  const queryClient = useQueryClient();
  const invalidationManager = useInvalidationManager();
  const subscriptionIdsRef = useRef<string[]>([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced update function
  const debouncedUpdate = (updateFn: () => void, delay = 300) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(updateFn, delay);
  };

  // Smart venue cache update
  const updateVenueCache = (newVenue: Venue, changeType: 'update' | 'create' | 'delete' = 'update') => {
    if (changeType === 'update' || changeType === 'create') {
      // Direct cache update for individual venue
      queryClient.setQueryData(queryKeys.venues.byId(venueId!), newVenue);
      
      // Update venues list cache
      queryClient.setQueryData(queryKeys.venues.all, (old: Venue[] | undefined) => {
        if (!old) return old;
        
        const exists = old.some(venue => venue.id === venueId);
        if (exists) {
          return old.map(venue => venue.id === venueId ? newVenue : venue);
        } else if (changeType === 'create') {
          return [newVenue, ...old];
        }
        return old;
      });

      // Update brewery venues cache if brewery_id exists
      if (newVenue.brewery_id) {
        queryClient.setQueryData(
          queryKeys.venues.byBrewery(newVenue.brewery_id),
          (old: Venue[] | undefined) => {
            if (!old) return old;
            const exists = old.some(venue => venue.id === venueId);
            if (exists) {
              return old.map(venue => venue.id === venueId ? newVenue : venue);
            } else if (changeType === 'create') {
              return [newVenue, ...old];
            }
            return old;
          }
        );
      }

      console.log(`[Smart Update] Direct cache update for venue: ${newVenue.name}`);
      
      if (onVenueUpdate) {
        onVenueUpdate(newVenue);
      }
    } else if (changeType === 'delete') {
      // Remove from all relevant caches
      invalidationManager.invalidateByEntity('venue', venueId!, 'delete');
    }
  };

  useEffect(() => {
    if (!venueId) return;

    console.log(`Setting up smart real-time subscriptions for venue: ${venueId}`);

    // Subscribe to venue updates with smart caching
    const venueSubId = subscribe(
      'venue_updated',
      (payload) => {
        console.log('Venue updated:', payload);
        
        if (payload.new && payload.eventType !== 'DELETE') {
          debouncedUpdate(() => {
            updateVenueCache(payload.new as Venue, payload.eventType === 'INSERT' ? 'create' : 'update');
          });
        } else if (payload.eventType === 'DELETE') {
          debouncedUpdate(() => {
            updateVenueCache(payload.old as Venue, 'delete');
          });
        } else {
          // Fallback invalidation
          invalidationManager.invalidateQueries(queryKeys.venues.all);
        }
      },
      { id: venueId }
    );

    // Subscribe to venue hours updates with selective invalidation
    const hoursSubId = subscribe(
      'venue_hours_updated',
      (payload) => {
        console.log('Venue hours updated:', payload);
        debouncedUpdate(() => {
          invalidationManager.invalidateQueries(queryKeys.venues.hours(venueId), { exact: true });
        }, 100);
      },
      { venue_id: venueId }
    );

    // Subscribe to happy hours updates
    const happyHoursSubId = subscribe(
      'venue_happy_hours_updated',
      (payload) => {
        console.log('Venue happy hours updated:', payload);
        debouncedUpdate(() => {
          invalidationManager.invalidateQueries(queryKeys.venues.happyHours(venueId), { exact: true });
        }, 100);
      },
      { venue_id: venueId }
    );

    // Subscribe to daily specials updates
    const dailySpecialsSubId = subscribe(
      'venue_daily_specials_updated',
      (payload) => {
        console.log('Venue daily specials updated:', payload);
        debouncedUpdate(() => {
          invalidationManager.invalidateQueries(queryKeys.venues.dailySpecials(venueId), { exact: true });
        }, 100);
      },
      { venue_id: venueId }
    );

    // Subscribe to venue events updates
    const eventsSubId = subscribe(
      'venue_events_updated',
      (payload) => {
        console.log('Venue events updated:', payload);
        debouncedUpdate(() => {
          // Invalidate both venue-specific and general events queries
          invalidationManager.invalidateQueries(queryKeys.venues.events(venueId), { exact: true });
          invalidationManager.invalidateQueries(queryKeys.events.all);
        }, 200);
      },
      { venue_id: venueId }
    );

    subscriptionIdsRef.current = [venueSubId, hoursSubId, happyHoursSubId, dailySpecialsSubId, eventsSubId];

    return () => {
      console.log(`Cleaning up smart real-time subscriptions for venue: ${venueId}`);
      subscriptionIdsRef.current.forEach(id => unsubscribe(id));
      subscriptionIdsRef.current = [];
      
      // Clear any pending updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, [venueId, subscribe, unsubscribe, queryClient, onVenueUpdate, invalidationManager]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);
};
