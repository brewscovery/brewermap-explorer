import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    console.log('Setting up realtime subscription for check-ins analytics');
    
    const channel = supabase
      .channel('checkins-analytics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checkins',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Check-in change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['userAnalytics', userId] });
        }
      )
      .subscribe((status) => {
        console.log('Checkins analytics channel subscription status:', status);
      });

    // Store channel reference for cleanup
    channelRef.current = channel;

    return () => {
      console.log('Cleaning up realtime subscription for check-ins analytics');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ['userAnalytics', userId],
    queryFn: async (): Promise<UserAnalytics> => {
      if (!userId) throw new Error('User ID is required');
      
      const { data, error } = await supabase
        .rpc('get_user_checkin_analytics', { user_id: userId });
        
      if (error) throw error;
      
      // Type assertion and safety checks
      const analyticsData = data as any; // First cast to any
      
      return {
        uniqueVenuesVisited: typeof analyticsData?.uniqueVenuesVisited === 'number' 
          ? analyticsData.uniqueVenuesVisited 
          : 0,
        totalVenues: typeof analyticsData?.totalVenues === 'number' 
          ? analyticsData.totalVenues 
          : 0,
        venuesByCountry: Array.isArray(analyticsData?.venuesByCountry) 
          ? analyticsData.venuesByCountry 
          : []
      };
    },
    enabled: !!userId
  });
};
