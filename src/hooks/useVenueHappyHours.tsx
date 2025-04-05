
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVenueHappyHoursRealtimeUpdates } from './useVenueHappyHoursRealtimeUpdates';
import { categorizeHappyHours } from '@/utils/happyHourUtils';
import type { VenueHappyHour, VenueHappyHourInput } from '@/types/venueHappyHours';

export type { VenueHappyHour, VenueHappyHourInput } from '@/types/venueHappyHours';

export const useVenueHappyHours = (venueId: string | null) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Set up realtime subscription for happy hours
  useVenueHappyHoursRealtimeUpdates(venueId);

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
