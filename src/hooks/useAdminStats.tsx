import { useOptimizedSupabaseQuery } from './useOptimizedSupabaseQuery';
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
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchStats
  });
  
  return { data, isLoading, error };
};
