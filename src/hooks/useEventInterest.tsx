
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimizedSupabaseQuery } from './useOptimizedSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { VenueEvent } from './useVenueEvents';

export const useEventInterest = (event: VenueEvent) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query to check if the user is interested in this event
  const { data: isInterested = false, isLoading: isInterestLoading } = useOptimizedSupabaseQuery<boolean>(
    ['eventInterest', event.id, user?.id],
    'event_interests',
    async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('event_interests')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      return !!data;
    },
    'HIGH',
    60000, // 1 minute stale time
    !!user
  );

  // New query to count interested users
  const { data: interestedUsersCount = 0, isLoading: isCountLoading } = useOptimizedSupabaseQuery<number>(
    ['eventInterestedUsersCount', event.id],
    'event_interests',
    async () => {
      const { count, error } = await supabase
        .from('event_interests')
        .select('user_id', { count: 'exact' })
        .eq('event_id', event.id);
      
      if (error) throw error;
      
      return count || 0;
    },
    'NORMAL',
    120000 // 2 minutes stale time for counts
  );

  // Mutation to toggle event interest
  const toggleInterestMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('User must be logged in');
      }

      if (isInterested) {
        // Remove interest
        const { error } = await supabase
          .from('event_interests')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return false;
      } else {
        // Add interest
        const { error } = await supabase
          .from('event_interests')
          .insert({
            event_id: event.id,
            user_id: user.id
          });
        
        if (error) throw error;
        return true;
      }
    },
    onSuccess: (newInterestState) => {
      // Update isInterested state optimistically
      queryClient.setQueryData(
        ['eventInterest', event.id, user?.id], 
        newInterestState
      );

      // Update the count optimistically
      const currentCount = queryClient.getQueryData(['eventInterestedUsersCount', event.id]) as number || 0;
      queryClient.setQueryData(
        ['eventInterestedUsersCount', event.id],
        newInterestState ? currentCount + 1 : Math.max(currentCount - 1, 0)
      );

      // Invalidate both queries separately and force refetch
      queryClient.invalidateQueries({ 
        queryKey: ['eventInterest', event.id, user?.id]
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['eventInterestedUsersCount', event.id],
        refetchType: 'active'
      });

      // Show a toast notification
      if (newInterestState) {
        toast.success('You are now interested in this event');
      } else {
        toast.info('Removed interest from this event');
      }
    },
    onError: (error) => {
      console.error('Error toggling event interest:', error);
      toast.error('Failed to update event interest');
    }
  });

  return {
    isInterested,
    interestedUsersCount,
    isLoading: isInterestLoading || isCountLoading,
    toggleInterest: toggleInterestMutation.mutate
  };
};
