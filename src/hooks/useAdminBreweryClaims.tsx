
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { callEdgeFunction } from '@/utils/adminApiUtils';
import { BreweryClaim } from '@/types/admin';

// Hook for fetching brewery claims
export const useBreweryClaims = () => {
  const fetchClaims = async () => {
    try {
      const data = await callEdgeFunction('admin-get-claims');
      return data.claims as BreweryClaim[];
    } catch (error) {
      console.error('Error fetching brewery claims:', error);
      throw error;
    }
  };
  
  return useQuery({
    queryKey: ['admin', 'brewery-claims'],
    queryFn: fetchClaims
  });
};

// Hook for updating brewery claim status
export const useBreweryClaimUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      claimId, 
      status, 
      adminNotes 
    }: { 
      claimId: string; 
      status: 'pending' | 'approved' | 'rejected'; 
      adminNotes: string | null 
    }) => {
      try {
        const data = await callEdgeFunction('admin-update-claim', { 
          claimId, 
          status, 
          adminNotes 
        });
        return data.claim;
      } catch (error) {
        console.error('Error updating brewery claim:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brewery-claims'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Claim updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Claim update failed: ${error.message}`);
    }
  });
};
