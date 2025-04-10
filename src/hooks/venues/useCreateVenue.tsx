
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for creating a new venue
 */
export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (venueData: any) => {
      try {
        console.log('Creating venue with data:', venueData);
        const { data, error } = await supabase
          .from('venues')
          .insert({ 
            ...venueData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating venue:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['breweryVenues', data.brewery_id] });
      toast.success('Venue created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create venue: ${error.message}`);
    }
  });
};
