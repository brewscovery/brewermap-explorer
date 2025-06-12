import { callEdgeFunction } from '@/utils/adminApiUtils';
import { AdminStats } from '@/types/admin';
import { useQuery } from '@tanstack/react-query';

// Hook for fetching admin dashboard stats
export const useAdminStats = () => {
  const fetchStats = async () => {
    try {
      console.log('Fetching admin stats...');
      const data = await callEdgeFunction('admin-get-stats');
      console.log('Received admin stats:', data);
      return data.stats as AdminStats;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  };
  
  // Note: This uses edge functions, not direct Supabase queries, so keeping useQuery
  // Adding refetchInterval to refresh every second for real-time updates
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchStats,
    refetchInterval: 1000, // Refresh every second
    refetchIntervalInBackground: true // Continue refreshing even when tab is not active
  });
  
  return { data, isLoading, error };
};
