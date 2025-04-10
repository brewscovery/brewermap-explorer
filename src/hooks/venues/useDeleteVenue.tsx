
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for deleting a venue
 */
export const useDeleteVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (venueId: string) => {
      try {
        console.log('Deleting venue:', venueId);
        // First get the venue to get the brewery_id for cache invalidation
        const { data: venue } = await supabase
          .from('venues')
          .select('brewery_id')
          .eq('id', venueId)
          .single();
        
        const breweryId = venue?.brewery_id;
        
        const { error } = await supabase
          .from('venues')
          .delete()
          .eq('id', venueId);
        
        if (error) throw error;
        
        return { venueId, breweryId };
      } catch (error) {
        console.error('Error deleting venue:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Venue deleted, invalidating queries for brewery:', data.breweryId);
      if (data.breweryId) {
        queryClient.invalidateQueries({ queryKey: ['breweryVenues', data.breweryId] });
      }
      toast.success('Venue deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete venue: ${error.message}`);
    }
  });
};
