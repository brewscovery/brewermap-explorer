
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Brewery } from '@/types/brewery';
import type { Venue } from '@/types/venue';

// Hook for creating a brewery
export const useCreateBrewery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (breweryData: Partial<Brewery> & { name: string }) => {
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

// Hook for fetching venues for a specific brewery
export const useBreweryVenues = (breweryId: string | null) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['admin', 'brewery', breweryId, 'venues'],
    queryFn: async () => {
      if (!breweryId) return [];
      
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('brewery_id', breweryId)
        .order('name');
      
      if (error) throw error;
      
      return data as Venue[];
    },
    enabled: !!breweryId
  });
};

// Hook for creating a venue
export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (venueData: Partial<Venue> & { 
      name: string; 
      brewery_id: string;
      city: string;
      state: string;
    }) => {
      const { data, error } = await supabase
        .from('venues')
        .insert(venueData)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brewery', data.brewery_id, 'venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast.success('Venue created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create venue: ${error.message}`);
    }
  });
};

// Hook for deleting a venue
export const useDeleteVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (venueId: string) => {
      // First get the venue to know its brewery_id for cache invalidation
      const { data: venue, error: fetchError } = await supabase
        .from('venues')
        .select('brewery_id')
        .eq('id', venueId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Then delete the venue
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', venueId);
      
      if (error) throw error;
      
      return { venueId, breweryId: venue.brewery_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brewery', data.breweryId, 'venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast.success('Venue deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete venue: ${error.message}`);
    }
  });
};
