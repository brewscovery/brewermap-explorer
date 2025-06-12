
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimizedSupabaseQuery } from './useOptimizedSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { NotificationPreferences } from '@/types/notification';

export const useNotificationPreferences = () => {
  const { user, userType } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's notification preferences
  const { data: preferences, isLoading } = useOptimizedSupabaseQuery<NotificationPreferences | null>(
    ['notificationPreferences', user?.id],
    'notification_preferences',
    async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as NotificationPreferences | null;
    },
    'HIGH',
    60000, // 1 minute stale time for preferences
    !!user?.id
  );

  // Update notification preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Prevent business users from updating preferences they shouldn't have access to
      if (userType === 'business') {
        // Business users can only update claim_updates
        const allowedUpdates = { claim_updates: updates.claim_updates };
        const { error } = await supabase
          .from('notification_preferences')
          .update({
            ...allowedUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Regular users can update all preferences except claim_updates
        const { claim_updates, ...allowedUpdates } = updates;
        const { error } = await supabase
          .from('notification_preferences')
          .update({
            ...allowedUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success('Notification preferences updated');
    },
    onError: (error) => {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
    },
  });

  return {
    preferences,
    isLoading,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
  };
};
