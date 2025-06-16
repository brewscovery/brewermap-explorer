
import { useOptimizedSupabaseQuery } from './useOptimizedSupabaseQuery';
import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  content: string;
  related_entity_id: string | null;
  related_entity_type: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

interface NotificationPage {
  data: Notification[];
  hasMore: boolean;
  nextPage?: number;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<NotificationPage, Error>({
    queryKey: ['notifications', user?.id],
    queryFn: async ({ pageParam = 0 }: { pageParam: number }) => {
      if (!user) return { data: [], hasMore: false };
      
      const from = pageParam * 5;
      const to = from + 4;
      
      const { data: notifications, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      const hasMore = count ? from + 5 < count : false;
      
      return {
        data: notifications || [],
        hasMore,
        nextPage: hasMore ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage: NotificationPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  // Flatten all pages into a single notifications array
  const notifications = data?.pages.flatMap(page => page.data) || [];
  const unreadNotifications = notifications.filter(n => !n.read_at);

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .is('read_at', null);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast.success('Notification deleted');
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    },
  });

  return {
    notifications,
    unreadNotifications,
    unreadCount: unreadNotifications.length,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};
