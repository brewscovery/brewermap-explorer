
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useInvalidationManager } from '@/contexts/InvalidationContext';
import { queryKeys } from '@/utils/queryKeys';
import { toast } from 'sonner';
import type { Notification } from '@/types/notification';

export const useRealtimeUser = () => {
  const { user } = useAuth();
  const { subscribe, unsubscribe } = useRealtime();
  const queryClient = useQueryClient();
  const invalidationManager = useInvalidationManager();
  const subscriptionIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    console.log(`Setting up real-time subscriptions for user: ${user.id}`);

    // Subscribe to notifications
    const notificationSubId = subscribe(
      'notification_received',
      (payload) => {
        console.log('New notification received:', payload);
        
        if (payload.eventType === 'INSERT' && payload.new) {
          const notification = payload.new as Notification;
          
          // Direct cache update for notifications
          queryClient.setQueryData(
            queryKeys.users.notifications(user.id),
            (old: { pages: { data: Notification[] }[] } | undefined) => {
              if (!old) return old;
              const newPages = [...old.pages];
              if (newPages[0]) {
                newPages[0] = {
                  ...newPages[0],
                  data: [notification, ...newPages[0].data]
                };
              }
              return { ...old, pages: newPages };
            }
          );
          
          toast.info(notification.content, {
            duration: 5000,
            action: {
              label: 'View',
              onClick: () => {
                console.log('Open notification center');
              },
            },
          });
        } else {
          // Fallback invalidation
          invalidationManager.invalidateQueries(queryKeys.users.notifications(user.id));
        }
      },
      { user_id: user.id }
    );

    // Subscribe to checkins (for visited venues updates)
    const checkinSubId = subscribe(
      'checkin_created',
      (payload) => {
        console.log('New checkin created:', payload);
        
        // Smart invalidation for checkin-related queries
        invalidationManager.invalidateByEntity('checkin', user.id, 'create');
      },
      { user_id: user.id }
    );

    subscriptionIdsRef.current = [notificationSubId, checkinSubId];

    return () => {
      console.log(`Cleaning up real-time subscriptions for user: ${user.id}`);
      subscriptionIdsRef.current.forEach(id => unsubscribe(id));
      subscriptionIdsRef.current = [];
    };
  }, [user?.id, subscribe, unsubscribe, queryClient, invalidationManager]);
};
