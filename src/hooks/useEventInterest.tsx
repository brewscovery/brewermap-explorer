
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { VenueEvent } from './useVenueEvents';

export const useEventInterest = (event: VenueEvent) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query to check if the user is interested in this event
  const { data: isInterested, isLoading: isInterestLoading } = useQuery({
    queryKey: ['eventInterest', event.id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('event_interests')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        // If no rows found, user is not interested
        if (error.code === 'PGRST116') return false;
        throw error;
      }
      
      return !!data;
    },
    enabled: !!user
  });

  // New query to count interested users
  const { data: interestedUsersCount = 0, isLoading: isCountLoading } = useQuery({
    queryKey: ['eventInterestedUsersCount', event.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('event_interests')
        .select('user_id', { count: 'exact' })
        .eq('event_id', event.id);
      
      if (error) throw error;
      
      return count || 0;
    }
  });

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
      // Optimistically update the query cache
      queryClient.setQueryData(
        ['eventInterest', event.id, user?.id], 
        newInterestState
      );

      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['eventInterest', event.id, user?.id],
        queryKey: ['eventInterestedUsersCount', event.id]
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
