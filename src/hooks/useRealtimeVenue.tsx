import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/contexts/RealtimeContext';
import type { Venue } from '@/types/venue';

export const useRealtimeVenue = (venueId: string | null, onVenueUpdate?: (venue: Venue) => void) => {
  const { subscribe, unsubscribe } = useRealtime();
  const queryClient = useQueryClient();
  const subscriptionIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!venueId) return;

    console.log(`Setting up real-time subscriptions for venue: ${venueId}`);

    // Subscribe to venue updates
    const venueSubId = subscribe(
      'venue_updated',
      (payload) => {
        console.log('Venue updated:', payload);
        queryClient.invalidateQueries({ queryKey: ['venues'] });
        
        if (onVenueUpdate && payload.new) {
          onVenueUpdate(payload.new as Venue);
        }
      },
      { id: venueId }
    );

    // Subscribe to venue hours updates
    const hoursSubId = subscribe(
      'venue_hours_updated',
      (payload) => {
        console.log('Venue hours updated:', payload);
        queryClient.invalidateQueries({ queryKey: ['venueHours', venueId] });
      },
      { venue_id: venueId }
    );

    // Subscribe to happy hours updates
    const happyHoursSubId = subscribe(
      'venue_happy_hours_updated',
      (payload) => {
        console.log('Venue happy hours updated:', payload);
        queryClient.invalidateQueries({ queryKey: ['venueHappyHours', venueId] });
      },
      { venue_id: venueId }
    );

    // Subscribe to daily specials updates
    const dailySpecialsSubId = subscribe(
      'venue_daily_specials_updated',
      (payload) => {
        console.log('Venue daily specials updated:', payload);
        queryClient.invalidateQueries({ queryKey: ['venueDailySpecials', venueId] });
      },
      { venue_id: venueId }
    );

    // Subscribe to venue events updates
    const eventsSubId = subscribe(
      'venue_events_updated',
      (payload) => {
        console.log('Venue events updated:', payload);
        queryClient.invalidateQueries({ queryKey: ['venueEvents', venueId] });
        queryClient.invalidateQueries({ queryKey: ['multipleVenueEvents'] });
      },
      { venue_id: venueId }
    );

    subscriptionIdsRef.current = [venueSubId, hoursSubId, happyHoursSubId, dailySpecialsSubId, eventsSubId];

    return () => {
      console.log(`Cleaning up real-time subscriptions for venue: ${venueId}`);
      subscriptionIdsRef.current.forEach(id => unsubscribe(id));
      subscriptionIdsRef.current = [];
    };
  }, [venueId, subscribe, unsubscribe, queryClient, onVenueUpdate]);
};
