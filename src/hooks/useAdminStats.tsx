
import { useQuery } from '@tanstack/react-query';
import { callEdgeFunction } from '@/utils/adminApiUtils';
import { AdminStats } from '@/types/admin';

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
  
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchStats
  });
};
