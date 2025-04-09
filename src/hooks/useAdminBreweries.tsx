
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Brewery } from '@/types/brewery';
import type { Venue } from '@/types/venue';

// Helper function to get auth token for edge function calls
const getAuthToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
};

// Type for brewery create/update data
export interface BreweryFormData {
  name: string;
  brewery_type: string | null;
  website_url: string | null;
  about: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  logo_url: string | null;
  is_verified: boolean;
}

// Type for venue create/update data
export interface VenueFormData {
  brewery_id: string;
  name: string;
  street: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  country: string | null;
  longitude: string | null;
  latitude: string | null;
  phone: string | null;
  website_url: string | null;
}

// Hook for creating a brewery
export const useCreateBrewery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (breweryData: BreweryFormData) => {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('admin-brewery-operations', {
        body: {
          operation: 'createBrewery',
          breweryData
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error) throw error;
      
      return data.brewery as Brewery;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'breweries'] });
      toast.success('Brewery created successfully');
    },
    onError: (error) => {
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
      breweryData: Partial<BreweryFormData>;
    }) => {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('admin-brewery-operations', {
        body: {
          operation: 'updateBrewery',
          breweryId,
          breweryData
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error) throw error;
      
      return data.brewery as Brewery;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'breweries'] });
      toast.success('Brewery updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update brewery: ${error.message}`);
    }
  });
};

// Hook for deleting a brewery
export const useDeleteBrewery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (breweryId: string) => {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('admin-brewery-operations', {
        body: {
          operation: 'deleteBrewery',
          breweryId
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'breweries'] });
      toast.success('Brewery deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete brewery: ${error.message}`);
    }
  });
};

// Hook for creating a venue
export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (venueData: VenueFormData) => {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('admin-brewery-operations', {
        body: {
          operation: 'createVenue',
          venueData
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error) throw error;
      
      return data.venue as Venue;
    },
    onSuccess: () => {
      toast.success('Venue created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create venue: ${error.message}`);
    }
  });
};

// Hook for updating a venue
export const useUpdateVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      venueId, 
      venueData 
    }: { 
      venueId: string; 
      venueData: Partial<VenueFormData>;
    }) => {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('admin-brewery-operations', {
        body: {
          operation: 'updateVenue',
          venueId,
          venueData
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error) throw error;
      
      return data.venue as Venue;
    },
    onSuccess: () => {
      toast.success('Venue updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update venue: ${error.message}`);
    }
  });
};

// Hook for deleting a venue
export const useDeleteVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (venueId: string) => {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('admin-brewery-operations', {
        body: {
          operation: 'deleteVenue',
          venueId
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      toast.success('Venue deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete venue: ${error.message}`);
    }
  });
};

// Hook for fetching venues for a brewery
export const useBreweryVenues = (breweryId: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchVenues = async () => {
    if (!breweryId) {
      setVenues([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('brewery_id', breweryId)
        .order('name');
        
      if (error) throw error;
      
      setVenues(data);
    } catch (err) {
      console.error('Error fetching brewery venues:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch venues'));
      toast.error('Failed to load venues');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fix: Change useState() to useEffect() and correct the dependency array
  useEffect(() => {
    fetchVenues();
  }, [breweryId]);
  
  return {
    venues,
    isLoading,
    error,
    refetch: fetchVenues
  };
};

export default {
  useCreateBrewery,
  useUpdateBrewery,
  useDeleteBrewery,
  useCreateVenue,
  useUpdateVenue,
  useDeleteVenue,
  useBreweryVenues
};
