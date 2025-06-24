import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Notification } from '@/types/notification';

export const useRealtimeUser = () => {
  const { user } = useAuth();
  const { subscribe, unsubscribe } = useRealtime();
  const queryClient = useQueryClient();
  const subscriptionIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    console.log(`Setting up real-time subscriptions for user: ${user.id}`);

    // Subscribe to notifications
    const notificationSubId = subscribe(
      'notification_received',
      (payload) => {
        console.log('New notification received:', payload);
        
        if (payload.eventType === 'INSERT') {
          const notification = payload.new as Notification;
          toast.info(notification.content, {
            duration: 5000,
            action: {
              label: 'View',
              onClick: () => {
                console.log('Open notification center');
              },
            },
          });
        }
        
        queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      },
      { user_id: user.id }
    );

    // Subscribe to checkins (for visited venues updates)
    const checkinSubId = subscribe(
      'checkin_created',
      (payload) => {
        console.log('New checkin created:', payload);
        queryClient.invalidateQueries({ queryKey: ['checkins', user.id] });
        queryClient.invalidateQueries({ queryKey: ['venueCheckins'] });
        queryClient.invalidateQueries({ queryKey: ['todoListVenues', user.id] });
      },
      { user_id: user.id }
    );

    subscriptionIdsRef.current = [notificationSubId, checkinSubId];

    return () => {
      console.log(`Cleaning up real-time subscriptions for user: ${user.id}`);
      subscriptionIdsRef.current.forEach(id => unsubscribe(id));
      subscriptionIdsRef.current = [];
    };
  }, [user?.id, subscribe, unsubscribe, queryClient]);
};
