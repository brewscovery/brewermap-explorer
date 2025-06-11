
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { categorizeHappyHours } from '@/utils/happyHourUtils';
import { NotificationService } from '@/services/NotificationService';
import type { VenueHappyHour, VenueHappyHourInput } from '@/types/venueHappyHours';

export type { VenueHappyHour, VenueHappyHourInput } from '@/types/venueHappyHours';

export const useVenueHappyHours = (venueId: string | null) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch happy hours
  const { 
    data: happyHours = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['venueHappyHours', venueId],
    queryFn: async () => {
      if (!venueId) return [];
      
      const { data, error } = await supabase
        .from('venue_happy_hours')
        .select('*')
        .eq('venue_id', venueId)
        .order('day_of_week');

      if (error) {
        toast.error('Failed to load happy hours');
        throw error;
      }
      
      return data as VenueHappyHour[];
    },
    enabled: !!venueId
  });

  /**
   * Update happy hour data
   */
  const updateHappyHours = async (happyHoursData: Partial<VenueHappyHour>[]) => {
    if (!venueId) {
      toast.error('Venue ID is missing');
      return false;
    }
    
    setIsUpdating(true);
    
    try {
      console.log('Existing happy hours by day:', happyHours);
      console.log('Updating with data:', happyHoursData);
      
      const { recordsToUpdate, recordsToInsert, idsToDelete } = categorizeHappyHours(
        venueId,
        happyHoursData,
        happyHours
      );
      
      console.log('Records to update:', recordsToUpdate);
      console.log('Records to insert:', recordsToInsert);

      // Track if we made any changes for notification purposes
      let hasChanges = false;

      // Update existing records
      if (recordsToUpdate.length > 0) {
        for (const record of recordsToUpdate) {
          const { error: updateError } = await supabase
            .from('venue_happy_hours')
            .update(record)
            .eq('id', record.id!);
            
          if (updateError) {
            console.error('Error updating existing happy hour:', updateError);
            throw updateError;
          }
        }
        hasChanges = true;
      }
      
      // Insert new records
      if (recordsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('venue_happy_hours')
          .insert(recordsToInsert);
          
        if (insertError) {
          console.error('Error inserting new happy hours:', insertError);
          throw insertError;
        }
        hasChanges = true;
      }

      console.log('Happy hours to delete:', idsToDelete);
      
      // Delete any happy hours that were removed in the UI
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('venue_happy_hours')
          .delete()
          .in('id', idsToDelete);
          
        if (deleteError) {
          console.error('Error deleting happy hours:', deleteError);
          throw deleteError;
        }
        hasChanges = true;
      }

      // Send notifications if we made changes
      if (hasChanges) {
        try {
          console.log('🏢 Fetching venue name for:', venueId);
          const { data: venue, error: venueError } = await supabase
            .from('venues')
            .select('name')
            .eq('id', venueId)
            .single();

          if (venueError) {
            console.error('❌ Error fetching venue name:', venueError);
            return;
          }

          if (!venue?.name) {
            console.error('❌ No venue found with id:', venueId);
            return;
          }

          console.log('🏢 Venue name found:', venue.name);

          const content = `${venue.name} has updated their happy hours!`;
            
          await NotificationService.notifyHappyHourUpdate(venueId, content);
          console.log('Happy hours update notifications sent');
        } catch (notificationError) {
          console.error('Error sending happy hours notifications:', notificationError);
          // Don't fail the whole operation for notification errors
        }
      }

      toast.success('Happy hours updated successfully');
      await refetch();
      return true;
    } catch (error: any) {
      console.error('Error updating happy hours:', error);
      toast.error(error.message || 'Failed to update happy hours');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete a happy hour
   */
  const deleteHappyHour = async (happyHourId: string) => {
    try {
      const { error } = await supabase
        .from('venue_happy_hours')
        .delete()
        .eq('id', happyHourId);

      if (error) throw error;

      toast.success('Happy hour deleted successfully');
      await refetch();
      return true;
    } catch (error: any) {
      console.error('Error deleting happy hour:', error);
      toast.error(error.message || 'Failed to delete happy hour');
      return false;
    }
  };

  return {
    happyHours,
    isLoading,
    error,
    refetch,
    isUpdating,
    updateHappyHours,
    deleteHappyHour
  };
};
