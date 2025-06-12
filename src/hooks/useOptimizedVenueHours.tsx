import { useState } from 'react';
import { useOptimizedSupabaseQuery } from './useOptimizedSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { connectionManager } from '@/services/ConnectionManager';
import type { VenueHour } from '@/types/venueHours';
import { toast } from 'sonner';
import { NotificationService } from '@/services/NotificationService';

export const useOptimizedVenueHours = (venueId: string | null) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  console.log(`useOptimizedVenueHours called with venueId: ${venueId}`);

  // Use optimized query with connection pooling
  const { 
    data: hours, 
    isLoading, 
    error, 
    refetch 
  } = useOptimizedSupabaseQuery<VenueHour[]>(
    ['venueHours', venueId],
    'venue_hours',
    (query) => query.select('*').eq('venue_id', venueId).order('day_of_week'),
    'HIGH', // High priority for venue hours
    60000 // 1 minute stale time
  );
  
  /**
   * Update venue hours data using connection pooling
   */
  const updateVenueHours = async (venueHoursData: Partial<VenueHour>[]) => {
    if (!venueId) {
      toast.error('Venue ID is missing');
      return false;
    }
    
    setIsUpdating(true);
    
    try {
      // Use connection manager for the update operation
      await connectionManager.executeQuery(async () => {
        // Validate all records before submitting
        for (const hourData of venueHoursData) {
          if (typeof hourData.day_of_week !== 'number') {
            throw new Error('day_of_week is required and must be a number');
          }
        }
        
        // Prepare data for batch upsert
        const batchData = venueHoursData.map(hourData => ({
          ...hourData,
          venue_id: venueId,
          day_of_week: hourData.day_of_week as number,
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
        return data;
      }, 8); // High priority for updates

      // Send notifications after successful update
      try {
        console.log('🏢 Fetching venue name for:', venueId);
        const venue = await connectionManager.executeQuery(async () => {
          const { data, error } = await supabase
            .from('venues')
            .select('name')
            .eq('id', venueId)
            .single();

          if (error) throw error;
          return data;
        }, 6); // Medium-high priority for venue name

        if (venue?.name) {
          console.log('🏢 Venue name found:', venue.name);

          // Check if any venue hours changed
          const hasVenueHoursChanges = venueHoursData.some(hour => 
            hour.venue_open_time !== undefined || hour.venue_close_time !== undefined
          );

          // Check if any kitchen hours changed
          const hasKitchenHoursChanges = venueHoursData.some(hour => 
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
    deleteVenueHours: async (hourId: string) => {
      if (!venueId) {
        toast.error('Venue ID is missing');
        return false;
      }
      
      try {
        await connectionManager.executeQuery(async () => {
          const { error } = await supabase
            .from('venue_hours')
            .delete()
            .eq('id', hourId)
            .eq('venue_id', venueId);

          if (error) throw error;
        }, 7); // High priority for deletes

        toast.success('Venue hour deleted successfully');
        await refetch();
        return true;
      } catch (error: any) {
        console.error('Error deleting venue hour:', error);
        toast.error(error.message || 'Failed to delete venue hour');
        return false;
      }
    }
  };
};
