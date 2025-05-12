
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DAYS_OF_WEEK } from '@/types/venueHours';

export const useCreateVenueHours = () => {
  const [isCreating, setIsCreating] = useState(false);

  /**
   * Create default venue hours for all 7 days of the week
   */
  const createDefaultVenueHours = async (venueId: string) => {
    if (!venueId) {
      console.error('Cannot create venue hours: Missing venue ID');
      return false;
    }

    setIsCreating(true);

    try {
      console.log(`Creating default venue hours for venue ${venueId}`);
      
      // Create an array of venue hour objects for each day of the week
      const venueHoursData = DAYS_OF_WEEK.map((_, index) => ({
        venue_id: venueId,
        day_of_week: index, // 0 = Monday, 6 = Sunday
        venue_open_time: '12:00:00',
        venue_close_time: '20:00:00',
        kitchen_open_time: '13:00:00',
        kitchen_close_time: '19:00:00',
        is_closed: true // Default to closed, so user must actively enable each day
      }));

      // Insert all venue hours in a batch operation
      const { data, error } = await supabase
        .from('venue_hours')
        .insert(venueHoursData)
        .select();

      if (error) {
        console.error('Error creating default venue hours:', error);
        throw error;
      }

      console.log(`Successfully created ${data.length} venue hour entries`);
      return true;
    } catch (error: any) {
      console.error('Error in createDefaultVenueHours:', error);
      toast.error(`Failed to set up venue hours: ${error.message}`);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createDefaultVenueHours,
    isCreating
  };
};
