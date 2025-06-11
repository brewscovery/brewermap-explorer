
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { VenueHour } from '@/types/venueHours';
import { toast } from 'sonner';
import { NotificationService } from '@/services/NotificationService';

export const useVenueHours = (venueId: string | null) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  console.log(`useVenueHours called with venueId: ${venueId}`);

  // Fetch venue hours
  const { 
    data: hours, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['venueHours', venueId],
    queryFn: async () => {
      console.log(`[DEBUG] Fetching venue hours for venueId: ${venueId}`);
      
      if (!venueId) return [];
      
      // Log the SQL query we're effectively executing
      console.log(`[DEBUG] SQL equivalent: SELECT * FROM venue_hours WHERE venue_id = '${venueId}' ORDER BY day_of_week`);
      
      const { data, error } = await supabase
        .from('venue_hours')
        .select('*')
        .eq('venue_id', venueId)
        .order('day_of_week');

      if (error) {
        console.error('Error fetching venue hours:', error);
        toast.error('Failed to load venue hours');
        throw error;
      }
      
      console.log(`[DEBUG] Venue hours data fetched:`, data);
      
      return data as VenueHour[];
    },
    enabled: !!venueId // Only enable the query if we have a venueId, regardless of auth state
  });
  
  /**
   * Update venue hours data using a batch operation
   */
  const updateVenueHours = async (venueHoursData: Partial<VenueHour>[]) => {
    if (!venueId) {
      toast.error('Venue ID is missing');
      return false;
    }
    
    setIsUpdating(true);
    
    try {
      // Validate all records before submitting
      for (const hourData of venueHoursData) {
        if (typeof hourData.day_of_week !== 'number') {
          throw new Error('day_of_week is required and must be a number');
        }
      }
      
      // Prepare data for batch upsert
      // Explicit typing to ensure day_of_week is treated as required
      const batchData = venueHoursData.map(hourData => ({
        ...hourData,
        venue_id: venueId,
        day_of_week: hourData.day_of_week as number, // Force non-optional type
        updated_at: new Date().toISOString()
      }));
      
      console.log('[DEBUG] Batch updating venue hours with data:', batchData);
      
      // Perform a single batch upsert operation
      const { data, error } = await supabase
        .from('venue_hours')
        .upsert(batchData)
        .select();

      if (error) throw error;

      console.log('[DEBUG] Batch update successful, updated hours:', data);

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
          const hasVenueHoursChanges = batchData.some(hour => 
            hour.venue_open_time !== undefined || hour.venue_close_time !== undefined
          );

          // Check if any kitchen hours changed
          const hasKitchenHoursChanges = batchData.some(hour => 
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

      toast.success('Venue hours updated successfully');
      await refetch();
      return true;
    } catch (error: any) {
      console.error('Error updating venue hours:', error);
      toast.error(error.message || 'Failed to update venue hours');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete a venue hour record
   */
  const deleteVenueHours = async (hourId: string) => {
    if (!venueId) {
      toast.error('Venue ID is missing');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('venue_hours')
        .delete()
        .eq('id', hourId)
        .eq('venue_id', venueId);

      if (error) throw error;

      toast.success('Venue hour deleted successfully');
      await refetch();
      return true;
    } catch (error: any) {
      console.error('Error deleting venue hour:', error);
      toast.error(error.message || 'Failed to delete venue hour');
      return false;
    }
  };

  return {
    hours: hours || [],
    isLoading,
    error,
    refetch,
    isUpdating,
    updateVenueHours,
    deleteVenueHours
  };
};
