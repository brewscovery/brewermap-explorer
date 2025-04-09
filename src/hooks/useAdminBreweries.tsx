
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Brewery } from '@/types/brewery';

// Hook for creating a brewery
export const useCreateBrewery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (breweryData: Partial<Brewery>) => {
      const { data, error } = await supabase
        .from('breweries')
        .insert(breweryData)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'breweries'] });
      toast.success('Brewery created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create brewery: ${error.message}`);
    }
  });
};

// Hook for updating a brewery
export const useUpdateBrewery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      breweryId, 
      breweryData 
    }: { 
      breweryId: string; 
      breweryData: Partial<Brewery>
    }) => {
      const { data, error } = await supabase
        .from('breweries')
        .update(breweryData)
        .eq('id', breweryId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'breweries'] });
      toast.success('Brewery updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update brewery: ${error.message}`);
    }
  });
};

// Hook for deleting a brewery
export const useDeleteBrewery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (breweryId: string) => {
      const { error } = await supabase
        .from('breweries')
        .delete()
        .eq('id', breweryId);
      
      if (error) throw error;
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'breweries'] });
      toast.success('Brewery deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete brewery: ${error.message}`);
    }
  });
};
