
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NotificationService } from '@/services/notificationService';

export const useVenueNotificationTriggers = () => {
  const channelRef = useRef<any>(null);
  const hasSetupRef = useRef(false);

  useEffect(() => {
    if (hasSetupRef.current) return;
    
    console.log('Setting up venue notification triggers');
    hasSetupRef.current = true;

    // Subscribe to venue hours changes
    const venueHoursChannel = supabase
      .channel('venue-hours-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'venue_hours'
        },
        async (payload) => {
          console.log('Venue hours updated, checking for notifications:', payload);
          
          if (payload.new && typeof payload.new === 'object' && 'venue_id' in payload.new) {
            const venueId = payload.new.venue_id as string;
            
            // Get venue name for the notification
            const { data: venue } = await supabase
              .from('venues')
              .select('name')
              .eq('id', venueId)
              .single();

            if (venue) {
              await NotificationService.createVenueNotifications(
                venueId,
                'VENUE_HOURS_UPDATE',
                `📅 ${venue.name} has updated their hours`,
                'venue'
              );
            }
          }
        }
      )
      .subscribe();

    // Subscribe to happy hours changes
    const happyHoursChannel = supabase
      .channel('happy-hours-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'venue_happy_hours'
        },
        async (payload) => {
          console.log('Venue happy hours updated, checking for notifications:', payload);
          
          const venueId = 
            (payload.new && typeof payload.new === 'object' && 'venue_id' in payload.new) ? payload.new.venue_id :
            (payload.old && typeof payload.old === 'object' && 'venue_id' in payload.old) ? payload.old.venue_id :
            null;

          if (venueId) {
            // Get venue name for the notification
            const { data: venue } = await supabase
              .from('venues')
              .select('name')
              .eq('id', venueId as string)
              .single();

            if (venue) {
              let content: string;
              if (payload.eventType === 'INSERT') {
                content = `🍻 ${venue.name} has added new happy hour specials!`;
              } else if (payload.eventType === 'UPDATE') {
                content = `🍻 ${venue.name} has updated their happy hour specials`;
              } else {
                content = `🍻 ${venue.name} has updated their happy hour information`;
              }

              await NotificationService.createVenueNotifications(
                venueId as string,
                'HAPPY_HOURS_UPDATE',
                content,
                'venue'
              );
            }
          }
        }
      )
      .subscribe();

    // Subscribe to daily specials changes
    const dailySpecialsChannel = supabase
      .channel('daily-specials-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'venue_daily_specials'
        },
        async (payload) => {
          console.log('Venue daily specials updated, checking for notifications:', payload);
          
          const venueId = 
            (payload.new && typeof payload.new === 'object' && 'venue_id' in payload.new) ? payload.new.venue_id :
            (payload.old && typeof payload.old === 'object' && 'venue_id' in payload.old) ? payload.old.venue_id :
            null;

          if (venueId) {
            // Get venue name for the notification
            const { data: venue } = await supabase
              .from('venues')
              .select('name')
              .eq('id', venueId as string)
              .single();

            if (venue) {
              await NotificationService.createVenueNotifications(
                venueId as string,
                'DAILY_SPECIAL_UPDATE',
                `🍽️ ${venue.name} has updated their daily specials`,
                'venue'
              );
            }
          }
        }
      )
      .subscribe();

    // Subscribe to venue events changes
    const eventsChannel = supabase
      .channel('venue-events-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'venue_events'
        },
        async (payload) => {
          console.log('Venue event updated, checking for notifications:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new && typeof payload.new === 'object') {
            const newEvent = payload.new as any;
            
            if ('venue_id' in newEvent && 'title' in newEvent) {
              // Get venue name for the notification
              const { data: venue } = await supabase
                .from('venues')
                .select('name')
                .eq('id', newEvent.venue_id)
                .single();

              if (venue) {
                await NotificationService.createVenueNotifications(
                  newEvent.venue_id,
                  'EVENT_CREATED',
                  `🎉 New event at ${venue.name}: ${newEvent.title}`,
                  'venue'
                );
              }
            }
          } else if (payload.eventType === 'UPDATE' && payload.new && typeof payload.new === 'object') {
            const updatedEvent = payload.new as any;
            
            if ('id' in updatedEvent && 'title' in updatedEvent) {
              await NotificationService.createEventNotifications(
                updatedEvent.id,
                'EVENT_UPDATED',
                `📝 Event updated: ${updatedEvent.title}`
              );
            }
          }
        }
      )
      .subscribe();

    channelRef.current = [venueHoursChannel, happyHoursChannel, dailySpecialsChannel, eventsChannel];

    return () => {
      console.log('Cleaning up venue notification triggers');
      if (channelRef.current) {
        channelRef.current.forEach((channel: any) => {
          supabase.removeChannel(channel);
        });
        channelRef.current = null;
      }
      hasSetupRef.current = false;
    };
  }, []);
};
