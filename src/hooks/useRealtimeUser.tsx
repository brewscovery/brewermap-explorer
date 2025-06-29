
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
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced notification handler to prevent spam
  const debouncedNotificationUpdate = (updateFn: () => void, delay = 500) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(updateFn, delay);
  };

  // Smart notification cache update
  const updateNotificationCache = (notification: Notification) => {
    const notificationsQueryKey = queryKeys.users.notifications(user!.id);
    
    // Direct cache update for notifications list
    queryClient.setQueryData(
      notificationsQueryKey,
      (old: { pages: { data: Notification[] }[] } | undefined) => {
        if (!old || !old.pages || !old.pages[0]) {
          // If no existing data, create initial structure
          return {
            pages: [{
              data: [notification],
              hasNextPage: false,
              nextCursor: null
            }],
            pageParams: [undefined]
          };
        }
        
        // Check if notification already exists to prevent duplicates
        const existingNotification = old.pages[0].data.find(n => n.id === notification.id);
        if (existingNotification) {
          console.log('Notification already exists in cache, skipping update');
          return old;
        }
        
        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          data: [notification, ...newPages[0].data]
        };
        
        console.log(`[Smart Update] Added notification to cache: ${notification.content}`);
        return { ...old, pages: newPages };
      }
    );
  };

  // Smart checkin update
  const updateCheckinCache = (checkinData: any) => {
    // Update multiple related caches efficiently
    const updates = [
      queryKeys.users.checkins(user!.id),
      queryKeys.users.analytics(user!.id)
    ];
    
    updates.forEach(queryKey => {
      const existingData = queryClient.getQueryData(queryKey);
      if (existingData) {
        // Only invalidate if data exists in cache
        invalidationManager.invalidateQueries(queryKey, { exact: true });
      }
    });
    
    console.log('[Smart Update] Updated checkin-related caches');
  };

  useEffect(() => {
    if (!user?.id) return;

    console.log(`Setting up smart real-time subscriptions for user: ${user.id}`);

    // Subscribe to notifications with smart caching and debouncing
    const notificationSubId = subscribe(
      'notification_received',
      (payload) => {
        console.log('New notification received:', payload);
        
        if (payload.eventType === 'INSERT' && payload.new) {
          const notification = payload.new as Notification;
          
          debouncedNotificationUpdate(() => {
            updateNotificationCache(notification);
            
            // Show toast notification
            toast.info(notification.content, {
              duration: 5000,
              action: {
                label: 'View',
                onClick: () => {
                  console.log('Open notification center');
                },
              },
            });
          });
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          // Handle notification updates (like marking as read)
          const updatedNotification = payload.new as Notification;
          queryClient.setQueryData(
            queryKeys.users.notifications(user.id),
            (old: { pages: { data: Notification[] }[] } | undefined) => {
              if (!old) return old;
              
              const newPages = old.pages.map(page => ({
                ...page,
                data: page.data.map(n => 
                  n.id === updatedNotification.id ? updatedNotification : n
                )
              }));
              
              return { ...old, pages: newPages };
            }
          );
        } else {
          // Fallback invalidation
          invalidationManager.invalidateQueries(queryKeys.users.notifications(user.id));
        }
      },
      { user_id: user.id }
    );

    // Subscribe to checkins with smart updates
    const checkinSubId = subscribe(
      'checkin_created',
      (payload) => {
        console.log('New checkin created:', payload);
        
        // Use debounced update for checkins to handle rapid checkins
        debouncedNotificationUpdate(() => {
          updateCheckinCache(payload);
        }, 200); // Shorter delay for checkins
      },
      { user_id: user.id }
    );

    subscriptionIdsRef.current = [notificationSubId, checkinSubId];

    return () => {
      console.log(`Cleaning up smart real-time subscriptions for user: ${user.id}`);
      subscriptionIdsRef.current.forEach(id => unsubscribe(id));
      subscriptionIdsRef.current = [];
      
      // Clear any pending updates
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = null;
      }
    };
  }, [user?.id, subscribe, unsubscribe, queryClient, invalidationManager]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);
};
