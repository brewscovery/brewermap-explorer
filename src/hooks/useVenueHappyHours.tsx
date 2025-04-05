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
      // Instead of deleting and reinserting, we'll use upsert logic
      // Prepare data for upsert with proper IDs
      const dataToUpsert = happyHoursData.map(hour => {
        if (typeof hour.day_of_week !== 'number') {
          throw new Error(`Missing required field 'day_of_week' for happy hour`);
        }
        
        return {
          // Keep id if it exists (for existing records)
          id: hour.id || undefined, // undefined will trigger auto-generation
          venue_id: venueId,
          day_of_week: hour.day_of_week,
          start_time: hour.start_time,
          end_time: hour.end_time,
          description: hour.description,
          is_active: hour.is_active !== undefined ? hour.is_active : true,
          updated_at: new Date().toISOString()
        };
      });

      // Use upsert operation (insert with onConflict handling)
      const { error: upsertError } = await supabase
        .from('venue_happy_hours')
        .upsert(dataToUpsert, { 
          onConflict: 'id', 
          ignoreDuplicates: false 
        });
          
      if (upsertError) throw upsertError;

      // Find happy hours that exist in the database but aren't in the updated data
      // (these need to be deleted)
      const existingIds = happyHours.map(hour => hour.id);
      const updatedIds = dataToUpsert
        .filter(hour => hour.id)
        .map(hour => hour.id as string);
        
      const idsToDelete = existingIds.filter(id => !updatedIds.includes(id));
      
      // Delete any happy hours that were removed in the UI
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('venue_happy_hours')
          .delete()
          .in('id', idsToDelete);
          
        if (deleteError) throw deleteError;
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
