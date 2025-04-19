
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserAnalytics {
  uniqueVenuesVisited: number;
  totalVenues: number;
  venuesByCountry: Array<{
    country: string;
    count: number;
  }>;
}

export const useUserAnalytics = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userAnalytics', userId],
    queryFn: async (): Promise<UserAnalytics> => {
      if (!userId) throw new Error('User ID is required');
      
      const { data, error } = await supabase
        .rpc('get_user_checkin_analytics', { user_id: userId });
        
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });
};
