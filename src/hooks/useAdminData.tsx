
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
  about: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  logo_url: string | null;
  is_verified: boolean | null;
  created_at: string;
  updated_at: string;
  venue_count: number;
  owner_name: string;
}

// User data type for admin panel
export interface UserData {
  id: string;
  user_type: 'admin' | 'business' | 'regular';
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

// Brewery claim data type
export interface BreweryClaim {
  id: string;
  brewery_id: string;
  brewery_name: string;
  user_id: string;
  user_name: string;
  status: 'pending' | 'approved' | 'rejected';
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
  decision_at: string | null;
  admin_notes: string | null;
}

// Admin stats type
export interface AdminStats {
  totalUsers: number;
  totalBreweries: number;
  pendingClaims: number;
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
    try {
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
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', await response.text());
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch breweries');
      }
      
      const data = await response.json();
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

// Hook for fetching admin dashboard stats
export const useAdminStats = () => {
  const fetchStats = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      if (!token) {
        throw new Error('No authenticated session');
      }
      
      const response = await fetch('/functions/v1/admin-get-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', await response.text());
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch admin stats');
      }
      
      const data = await response.json();
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

// Hook for fetching users for admin panel
export const useUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  const fetchUsers = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      if (!token) {
        throw new Error('No authenticated session');
      }
      
      const response = await fetch('/functions/v1/admin-get-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ searchQuery: debouncedSearchQuery })
      });
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', await response.text());
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      
      const data = await response.json();
      return data.users as UserData[];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'users', debouncedSearchQuery],
    queryFn: fetchUsers
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

// Hook for updating user type
export const useUpdateUserType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      userType 
    }: { 
      userId: string; 
      userType: 'admin' | 'business' | 'regular' 
    }) => {
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        
        if (!token) {
          throw new Error('No authenticated session');
        }
        
        const response = await fetch('/functions/v1/admin-update-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId, userType })
        });
        
        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Non-JSON response received:', await response.text());
          throw new Error('Invalid response format from server');
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update user type');
        }
        
        const data = await response.json();
        return data.user;
      } catch (error) {
        console.error('Error updating user type:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User type updated successfully');
    },
    onError: (error: any) => {
      toast.error(`User type update failed: ${error.message}`);
    }
  });
};

// Hook for fetching brewery claims
export const useBreweryClaims = () => {
  const fetchClaims = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      if (!token) {
        throw new Error('No authenticated session');
      }
      
      const response = await fetch('/functions/v1/admin-get-claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', await response.text());
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch brewery claims');
      }
      
      const data = await response.json();
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
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        
        if (!token) {
          throw new Error('No authenticated session');
        }
        
        const response = await fetch('/functions/v1/admin-update-claim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ claimId, status, adminNotes })
        });
        
        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Non-JSON response received:', await response.text());
          throw new Error('Invalid response format from server');
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update claim status');
        }
        
        const data = await response.json();
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
