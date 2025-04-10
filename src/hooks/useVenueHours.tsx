
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { VenueHour } from '@/types/venueHours';
import { toast } from 'sonner';
import { useVenueHoursRealtimeUpdates } from './useVenueHoursRealtimeUpdates';

export const useVenueHours = (venueId: string | null) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  console.log(`useVenueHours called with venueId: ${venueId}`);
  
  // Setup realtime subscriptions
  useVenueHoursRealtimeUpdates(venueId);

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
