
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface VenueDailySpecial {
  id: string;
  venue_id: string;
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export const useVenueDailySpecials = (venueId: string | null) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: dailySpecials = [], isLoading, error } = useQuery({
    queryKey: ['venueDailySpecials', venueId],
    queryFn: async () => {
      if (!venueId) return [];
      
      const { data, error } = await supabase
        .from('venue_daily_specials')
        .select(`
          id,
          venue_id,
          day_of_week,
          start_time,
          end_time,
          description,
          is_active,
          created_at,
          updated_at,
          updated_by
        `)
        .eq('venue_id', venueId)
        .order('day_of_week');
      
      if (error) throw error;
      
      return data as VenueDailySpecial[];
    },
    enabled: !!venueId
  });

  const updateDailySpecials = async (dailySpecialsData: any[]) => {
    if (!venueId || !user) {
      toast.error('Authentication required');
      return false;
    }
    
    try {
      setIsUpdating(true);
      
      // Process the daily specials data with updated_by information
      const processedData = dailySpecialsData.map(special => ({
        ...special,
        venue_id: venueId,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }));
      
      const { error } = await supabase
        .from('venue_daily_specials')
        .upsert(processedData, { onConflict: 'id' });
      
      if (error) throw error;
      
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ['venueDailySpecials', venueId] });
      
      toast.success('Daily specials updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating daily specials:', err);
      toast.error('Failed to update daily specials');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    dailySpecials,
    isLoading,
    error,
    updateDailySpecials,
    isUpdating
  };
};
