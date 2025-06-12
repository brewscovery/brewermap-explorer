
import { useState } from 'react';
import { useOptimizedSupabaseQuery } from './useOptimizedSupabaseQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { VenueHour } from '@/types/venueHours';
import { toast } from 'sonner';

export const useVenueHours = (venueId: string | null) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: hours = [], isLoading, error } = useOptimizedSupabaseQuery<VenueHour[]>(
    ['venueHours', venueId],
    'venue_hours',
    async () => {
      if (!venueId) return [];
      
      const { data, error } = await supabase
        .from('venue_hours')
        .select('*')
        .eq('venue_id', venueId)
        .order('day_of_week');
      
      if (error) {
        console.error('Error fetching venue hours:', error);
        throw error;
      }
      
      console.log(`Fetched venue hours for venue ${venueId}:`, data);
      return data || [];
    },
    'HIGH', 
    60000, // 1 minute stale time for hours
    !!venueId
  );

  // Mutation for updating venue hours
  const updateHoursMutation = useMutation({
    mutationFn: async (hoursData: Partial<VenueHour>[]) => {
      if (!venueId || !user) {
        throw new Error('Venue ID and user authentication required');
      }

      console.log('Updating venue hours:', hoursData);

      // Delete existing hours for this venue
      const { error: deleteError } = await supabase
        .from('venue_hours')
        .delete()
        .eq('venue_id', venueId);

      if (deleteError) {
        console.error('Error deleting existing hours:', deleteError);
        throw deleteError;
      }

      // Insert new hours
      const hoursToInsert = hoursData.map(hour => ({
        ...hour,
        venue_id: venueId,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }));

      const { data, error: insertError } = await supabase
        .from('venue_hours')
        .insert(hoursToInsert)
        .select();

      if (insertError) {
        console.error('Error inserting new hours:', insertError);
        throw insertError;
      }

      console.log('Successfully updated venue hours:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch venue hours
      queryClient.invalidateQueries({ queryKey: ['venueHours', venueId] });
      // Also invalidate the general venue hours query used by other components
      queryClient.invalidateQueries({ queryKey: ['venue-hours'] });
      toast.success('Venue hours updated successfully');
    },
    onError: (error) => {
      console.error('Error updating venue hours:', error);
      toast.error('Failed to update venue hours');
    },
  });

  return {
    hours,
    isLoading,
    error,
    updateVenueHours: async (hoursData: Partial<VenueHour>[]) => {
      try {
        await updateHoursMutation.mutateAsync(hoursData);
        return true;
      } catch (error) {
        console.error('Failed to update venue hours:', error);
        return false;
      }
    },
    isUpdating: updateHoursMutation.isPending,
  };
};
