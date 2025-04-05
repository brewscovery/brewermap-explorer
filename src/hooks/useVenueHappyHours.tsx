
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
      // First, delete existing happy hours for this venue
      const { error: deleteError } = await supabase
        .from('venue_happy_hours')
        .delete()
        .eq('venue_id', venueId);
        
      if (deleteError) throw deleteError;
      
      // Then insert the new ones
      if (happyHoursData.length > 0) {
        // Ensure all required fields are present
        const dataToInsert = happyHoursData.map(hour => {
          if (typeof hour.day_of_week !== 'number') {
            throw new Error(`Missing required field 'day_of_week' for happy hour`);
          }
          
          return {
            ...hour,
            venue_id: venueId,
            day_of_week: hour.day_of_week, // Explicitly include to satisfy TypeScript
            updated_at: new Date().toISOString()
          };
        });

        const { error: insertError } = await supabase
          .from('venue_happy_hours')
          .insert(dataToInsert);
          
        if (insertError) throw insertError;
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
