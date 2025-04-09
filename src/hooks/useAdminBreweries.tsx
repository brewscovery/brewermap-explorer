
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { callEdgeFunction } from '@/utils/adminApiUtils';
import { BreweryData } from '@/types/admin';

// Hook for fetching breweries for admin
export const useBreweries = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  const fetchBreweries = async () => {
    try {
      const data = await callEdgeFunction('admin-get-breweries', { 
        searchQuery: debouncedSearchQuery 
      });
      console.log('Fetched breweries:', data.breweries);
      return data.breweries as BreweryData[];
    } catch (error) {
      console.error('Error fetching breweries:', error);
      throw error;
    }
  };
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'breweries', debouncedSearchQuery],
    queryFn: fetchBreweries
  });
  
  return {
    data,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refetch
  };
};

// Hook for updating brewery verification status
export const useUpdateBreweryVerification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      breweryId, 
      isVerified 
    }: { 
      breweryId: string; 
      isVerified: boolean 
    }) => {
      const { data, error } = await supabase
        .from('breweries')
        .update({ is_verified: isVerified, updated_at: new Date().toISOString() })
        .eq('id', breweryId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'breweries'] });
      toast.success(`Brewery ${data.is_verified ? 'verified' : 'unverified'} successfully`);
    },
    onError: (error: any) => {
      toast.error(`Verification update failed: ${error.message}`);
    }
  });
};

// Hook for creating a new brewery
export const useCreateBrewery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (breweryData: any) => {
      try {
        const { data, error } = await supabase
          .from('breweries')
          .insert({ 
            ...breweryData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating brewery:', error);
        throw error;
      }
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
      breweryData: any 
    }) => {
      try {
        const { data, error } = await supabase
          .from('breweries')
          .update({ 
            ...breweryData,
            updated_at: new Date().toISOString()
          })
          .eq('id', breweryId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating brewery:', error);
        throw error;
      }
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
      try {
        const { error } = await supabase
          .from('breweries')
          .delete()
          .eq('id', breweryId);
        
        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Error deleting brewery:', error);
        throw error;
      }
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
