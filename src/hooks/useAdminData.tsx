
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Brewery data type with additional admin fields
export interface BreweryData {
  id: string;
  name: string;
  brewery_type: string | null;
  website_url: string | null;
  about: string | null; // Make sure this field is included
  facebook_url: string | null; // Make sure this field is included
  instagram_url: string | null; // Make sure this field is included
  logo_url: string | null; // Make sure this field is included
  is_verified: boolean | null;
  created_at: string;
  updated_at: string;
  venue_count: number;
  owner_name: string;
}

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
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    
    if (!token) {
      throw new Error('No authenticated session');
    }
    
    const response = await fetch('/functions/v1/admin-get-breweries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ searchQuery: debouncedSearchQuery })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch breweries');
    }
    
    const data = await response.json();
    console.log('Fetched breweries:', data.breweries);
    return data.breweries as BreweryData[];
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
