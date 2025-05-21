
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { VenueHour } from '@/types/venueHours';

export const useVenueHours = (venueId: string | null) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: hours = [], isLoading, error } = useQuery({
    queryKey: ['venueHours', venueId],
    queryFn: async () => {
      if (!venueId) return [];
      
      const { data, error } = await supabase
        .from('venue_hours')
        .select(`
          id,
          venue_id,
          day_of_week,
          venue_open_time,
          venue_close_time,
          kitchen_open_time,
          kitchen_close_time,
          is_closed,
          created_at,
          updated_at,
          updated_by
        `)
        .eq('venue_id', venueId)
        .order('day_of_week');
      
      if (error) throw error;
      
      return data as VenueHour[];
    },
    enabled: !!venueId
  });

  const updateVenueHours = async (hoursData: Partial<VenueHour>[]) => {
    if (!venueId || !user) {
      toast.error('Authentication required');
      return false;
    }
    
    try {
      setIsUpdating(true);
      
      // Process the hours data with updated_by information
      const processedData = hoursData.map(hour => {
        // Validate required fields
        if (typeof hour.day_of_week !== 'number') {
          throw new Error('day_of_week is required and must be a number');
        }

        return {
          ...hour,
          day_of_week: hour.day_of_week, // Ensure day_of_week is present
          venue_id: venueId,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        };
      });
      
      const { error } = await supabase
        .from('venue_hours')
        .upsert(processedData, { onConflict: 'id' });
      
      if (error) throw error;
      
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ['venueHours', venueId] });
      
      toast.success('Venue hours updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating venue hours:', err);
      toast.error('Failed to update venue hours');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    hours,
    isLoading,
    error,
    updateVenueHours,
    isUpdating
  };
};
