
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { categorizeDailySpecials } from '@/utils/dailySpecialUtils';
import { NotificationService } from '@/services/NotificationService';
import type { VenueDailySpecial, VenueDailySpecialInput } from '@/types/venueDailySpecials';

export type { VenueDailySpecial, VenueDailySpecialInput } from '@/types/venueDailySpecials';

export const useVenueDailySpecials = (venueId: string | null) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch daily specials
  const { 
    data: dailySpecials = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['venueDailySpecials', venueId],
    queryFn: async () => {
      if (!venueId) return [];
      
      const { data, error } = await supabase
        .from('venue_daily_specials')
        .select('*')
        .eq('venue_id', venueId)
        .order('day_of_week');

      if (error) {
        toast.error('Failed to load daily specials');
        throw error;
      }
      
      return data as VenueDailySpecial[];
    },
    enabled: !!venueId
  });

  /**
   * Update daily special data
   */
  const updateDailySpecials = async (dailySpecialsData: Partial<VenueDailySpecial>[]) => {
    if (!venueId) {
      toast.error('Venue ID is missing');
      return false;
    }
    
    setIsUpdating(true);
    
    try {
      console.log('Existing daily specials by day:', dailySpecials);
      console.log('Updating with data:', dailySpecialsData);
      
      const { recordsToUpdate, recordsToInsert, idsToDelete } = categorizeDailySpecials(
        venueId,
        dailySpecialsData,
        dailySpecials
      );
      
      console.log('Records to update:', recordsToUpdate);
      console.log('Records to insert:', recordsToInsert);
      
      // Track if we made any changes for notification purposes
      let hasChanges = false;
      
      // Update existing records
      if (recordsToUpdate.length > 0) {
        for (const record of recordsToUpdate) {
          const { error: updateError } = await supabase
            .from('venue_daily_specials')
            .update(record)
            .eq('id', record.id!);
            
          if (updateError) {
            console.error('Error updating existing daily special:', updateError);
            throw updateError;
          }
        }
        hasChanges = true;
      }
      
      // Insert new records
      if (recordsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('venue_daily_specials')
          .insert(recordsToInsert);
          
        if (insertError) {
          console.error('Error inserting new daily specials:', insertError);
          throw insertError;
        }
        hasChanges = true;
      }

      console.log('Daily specials to delete:', idsToDelete);
      
      // Delete any daily specials that were removed in the UI
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('venue_daily_specials')
          .delete()
          .in('id', idsToDelete);
          
        if (deleteError) {
          console.error('Error deleting daily specials:', deleteError);
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

          const content = `${venue.name} has updated their daily specials.`;
            
          await NotificationService.notifyDailySpecialUpdate(venueId, content);
          console.log('Daily special update notifications sent');
        } catch (notificationError) {
          console.error('Error sending daily special notifications:', notificationError);
          // Don't fail the whole operation for notification errors
        }
      }

      toast.success('Daily specials updated successfully');
      await refetch();
      return true;
    } catch (error: any) {
      console.error('Error updating daily specials:', error);
      toast.error(error.message || 'Failed to update daily specials');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete a daily special
   */
  const deleteDailySpecial = async (dailySpecialId: string) => {
    try {
      const { error } = await supabase
        .from('venue_daily_specials')
        .delete()
        .eq('id', dailySpecialId);

      if (error) throw error;

      // Send notification for deletion
      if (venueId) {
        try {
          await NotificationService.notifyDailySpecialUpdate(venueId, 'A daily special has been removed.');
          console.log('Daily special deletion notification sent');
        } catch (notificationError) {
          console.error('Error sending daily special deletion notification:', notificationError);
        }
      }

      toast.success('Daily special deleted successfully');
      await refetch();
      return true;
    } catch (error: any) {
      console.error('Error deleting daily special:', error);
      toast.error(error.message || 'Failed to delete daily special');
      return false;
    }
  };

  return {
    dailySpecials,
    isLoading,
    error,
    refetch,
    isUpdating,
    updateDailySpecials,
    deleteDailySpecial
  };
};
