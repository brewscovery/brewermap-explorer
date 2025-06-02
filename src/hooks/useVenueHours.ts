
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { VenueHour } from '@/types/venueHours';
import { NotificationService } from '@/services/NotificationService';

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

      // Send notifications after successful update
      try {
        console.log('🏢 Fetching venue name for:', venueId);
        const { data: venue, error: venueError } = await supabase
          .from('venues')
          .select('name')
          .eq('id', venueId)
          .single();

        if (venueError) {
          console.error('❌ Error fetching venue name:', venueError);
        } else if (venue?.name) {
          console.log('🏢 Venue name found:', venue.name);

          // Check if any venue hours changed
          const hasVenueHoursChanges = processedData.some(hour => 
            hour.venue_open_time !== undefined || hour.venue_close_time !== undefined
          );

          // Check if any kitchen hours changed
          const hasKitchenHoursChanges = processedData.some(hour => 
            hour.kitchen_open_time !== undefined || hour.kitchen_close_time !== undefined
          );

          if (hasVenueHoursChanges) {
            const content = `${venue.name} has updated their opening hours!`;
            await NotificationService.notifyVenueUpdate(venueId, 'VENUE_HOURS_UPDATE', content);
            console.log('Venue hours update notifications sent');
          }

          if (hasKitchenHoursChanges) {
            const content = `${venue.name} has updated their kitchen hours!`;
            await NotificationService.notifyVenueUpdate(venueId, 'KITCHEN_HOURS_UPDATE', content);
            console.log('Kitchen hours update notifications sent');
          }
        }
      } catch (notificationError) {
        console.error('Error sending venue hours notifications:', notificationError);
        // Don't fail the whole operation for notification errors
      }
      
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
