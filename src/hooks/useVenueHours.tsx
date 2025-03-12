
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { VenueHour } from '@/types/venueHours';
import { toast } from 'sonner';

export const useVenueHours = (venueId: string | null) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const { 
    data: hours, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['venueHours', venueId],
    queryFn: async () => {
      if (!venueId) return [];
      
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
      
      return data as VenueHour[];
    },
    enabled: !!venueId
  });
  
  const updateVenueHours = async (venueHoursData: Partial<VenueHour>[]) => {
    if (!venueId) {
      toast.error('Venue ID is missing');
      return false;
    }
    
    setIsUpdating(true);
    
    try {
      // Ensure each record has the required day_of_week field
      for (const hourData of venueHoursData) {
        // Validate day_of_week is present
        if (typeof hourData.day_of_week !== 'number') {
          throw new Error('day_of_week is required and must be a number');
        }
        
        const { error } = await supabase
          .from('venue_hours')
          .upsert({
            ...hourData,
            venue_id: venueId,
            day_of_week: hourData.day_of_week, // Ensure this is always included
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
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
