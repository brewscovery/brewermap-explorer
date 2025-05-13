
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { VenueEvent } from '@/types/venue';

export const useEventInterest = (eventOrId: VenueEvent | string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Get the event ID whether we're passed the event object or just the ID
  const eventId = typeof eventOrId === 'string' ? eventOrId : eventOrId.id;

  // Query to check if the user is interested in this event
  const { data: isInterested, isLoading: isInterestLoading } = useQuery({
    queryKey: ['eventInterest', eventId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('event_interests')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      return !!data;
    },
    enabled: !!user
  });

  // New query to count interested users
  const { data: interestedUsersCount = 0, isLoading: isCountLoading } = useQuery({
    queryKey: ['eventInterestedUsersCount', eventId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('event_interests')
        .select('user_id', { count: 'exact' })
        .eq('event_id', eventId);
      
      if (error) throw error;
      
      return count || 0;
    }
  });

  // Mutation to toggle event interest
  const toggleInterestMutation = useMutation({
    mutationFn: async (id = eventId) => {
      if (!user) {
        throw new Error('User must be logged in');
      }

      if (isInterested) {
        // Remove interest
        const { error } = await supabase
          .from('event_interests')
          .delete()
          .eq('event_id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return false;
      } else {
        // Add interest
        const { error } = await supabase
          .from('event_interests')
          .insert({
            event_id: id,
            user_id: user.id
          });
        
        if (error) throw error;
        return true;
      }
    },
    onSuccess: (newInterestState) => {
      // Update isInterested state optimistically
      queryClient.setQueryData(
        ['eventInterest', eventId, user?.id], 
        newInterestState
      );

      // Update the count optimistically
      const currentCount = queryClient.getQueryData(['eventInterestedUsersCount', eventId]) as number || 0;
      queryClient.setQueryData(
        ['eventInterestedUsersCount', eventId],
        newInterestState ? currentCount + 1 : Math.max(currentCount - 1, 0)
      );

      // Invalidate both queries separately and force refetch
      queryClient.invalidateQueries({ 
        queryKey: ['eventInterest', eventId, user?.id]
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['eventInterestedUsersCount', eventId],
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
    isInterested: isInterested || false,
    interestedUsersCount,
    isLoading: isInterestLoading || isCountLoading,
    toggleInterest: toggleInterestMutation.mutate
  };
};
