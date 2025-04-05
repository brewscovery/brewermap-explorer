
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVenueHappyHoursRealtimeUpdates } from './useVenueHappyHoursRealtimeUpdates';

export interface VenueHappyHour {
  id: string;
  venue_id: string;
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
      // Map existing happy hours to a lookup object by day_of_week
      const existingHappyHoursByDay = new Map();
      happyHours.forEach(hour => {
        existingHappyHoursByDay.set(hour.day_of_week, hour);
      });
      
      console.log('Existing happy hours by day:', existingHappyHoursByDay);
      console.log('Updating with data:', happyHoursData);
      
      // Instead of using upsert, we'll handle new and existing records separately
      // Process each happy hour record to determine if it's new or existing
      const recordsToUpdate: Partial<VenueHappyHour>[] = [];
      const recordsToInsert: Partial<VenueHappyHour>[] = [];
      
      for (const hour of happyHoursData) {
        if (typeof hour.day_of_week !== 'number') {
          throw new Error(`Missing required field 'day_of_week' for happy hour`);
        }
        
        // Check if we have an existing record for this day
        const existingHour = existingHappyHoursByDay.get(hour.day_of_week);
        
        const record = {
          venue_id: venueId,
          day_of_week: hour.day_of_week,
          start_time: hour.start_time,
          end_time: hour.end_time,
          description: hour.description,
          is_active: hour.is_active !== undefined ? hour.is_active : true,
          updated_at: new Date().toISOString()
        };
        
        if (existingHour) {
          // This is an update to an existing record
          recordsToUpdate.push({
            ...record,
            id: existingHour.id
          });
        } else {
          // This is a new record
          recordsToInsert.push(record);
        }
      }
      
      console.log('Records to update:', recordsToUpdate);
      console.log('Records to insert:', recordsToInsert);
      
      // Update existing records
      if (recordsToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from('venue_happy_hours')
          .upsert(recordsToUpdate);
          
        if (updateError) {
          console.error('Error updating existing happy hours:', updateError);
          throw updateError;
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

      // Find happy hours that exist in the database but aren't in the updated data
      // (these need to be deleted)
      const daysInUpdate = new Set(happyHoursData.map(hour => hour.day_of_week));
      const happyHoursToDelete = happyHours.filter(hour => !daysInUpdate.has(hour.day_of_week));
      const idsToDelete = happyHoursToDelete.map(hour => hour.id);
      
      console.log('Happy hours to delete:', happyHoursToDelete);
      
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
