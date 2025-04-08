
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type for brewery claims
export interface BreweryClaim {
  id: string;
  brewery_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
  decision_at: string | null;
  admin_notes: string | null;
  brewery_name?: string;
  user_name?: string;
}

// Type for admin dashboard stats
export interface AdminStats {
  totalUsers: number;
  totalBreweries: number;
  pendingClaims: number;
}

// Type for user data
export interface UserData {
  id: string;
  user_type: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

// Type for brewery data
export interface BreweryData {
  id: string;
  name: string;
  brewery_type: string | null;
  is_verified: boolean;
  website_url: string | null;
  created_at: string;
  venue_count?: number;
  owner_name?: string;
}

// Helper function to get auth token for edge function calls
const getAuthToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
};

// Hook for fetching brewery claims via edge function
export const useBreweryClaims = () => {
  return useQuery({
    queryKey: ['admin', 'brewery-claims'],
    queryFn: async () => {
      try {
        const token = await getAuthToken();
        
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        const { data, error } = await supabase.functions.invoke('admin-get-claims', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (error) throw error;
        
        return data.claims as BreweryClaim[];
      } catch (error) {
        console.error('Error in useBreweryClaims:', error);
        throw error;
      }
    },
  });
};

// Hook for updating a brewery claim via edge function
export const useBreweryClaimUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      claimId, 
      status, 
      adminNotes 
    }: { 
      claimId: string; 
      status: 'approved' | 'rejected' | 'pending'; 
      adminNotes?: string;
    }) => {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('admin-update-claim', {
        body: {
          claimId,
          status,
          adminNotes
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error) throw error;
      
      return data.claim as BreweryClaim;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brewery-claims'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'breweries'] });
    },
    onError: (error) => {
      toast.error(`Failed to update claim: ${error.message}`);
    }
  });
};

// Hook for fetching users via edge function
export const useUsers = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const query = useQuery({
    queryKey: ['admin', 'users', searchQuery],
    queryFn: async () => {
      try {
        const token = await getAuthToken();
        
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        const { data, error } = await supabase.functions.invoke('admin-get-users', {
          body: { searchQuery },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (error) throw error;
        
        return data.users as UserData[];
      } catch (error) {
        console.error('Error in useUsers:', error);
        throw error;
      }
    },
  });
  
  return {
    ...query,
    searchQuery,
    setSearchQuery
  };
};

// Hook for updating a user's type via edge function
export const useUpdateUserType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      userType 
    }: { 
      userId: string; 
      userType: 'business' | 'regular' | 'admin';
    }) => {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('admin-update-user', {
        body: {
          userId,
          userType
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error) throw error;
      
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User type updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user type: ${error.message}`);
    }
  });
};

// Hook for fetching breweries via edge function
export const useBreweries = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const query = useQuery({
    queryKey: ['admin', 'breweries', searchQuery],
    queryFn: async () => {
      try {
        const token = await getAuthToken();
        
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        const { data, error } = await supabase.functions.invoke('admin-get-breweries', {
          body: { searchQuery },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (error) throw error;
        
        return data.breweries as BreweryData[];
      } catch (error) {
        console.error('Error in useBreweries:', error);
        throw error;
      }
    },
  });
  
  return {
    ...query,
    searchQuery,
    setSearchQuery
  };
};

// Hook for updating a brewery's verification status via edge function
export const useUpdateBreweryVerification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      breweryId, 
      isVerified 
    }: { 
      breweryId: string; 
      isVerified: boolean;
    }) => {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('admin-update-brewery', {
        body: {
          breweryId,
          isVerified
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error) throw error;
      
      return data.brewery;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'breweries'] });
      toast.success('Brewery verification status updated');
    },
    onError: (error) => {
      toast.error(`Failed to update brewery: ${error.message}`);
    }
  });
};

// Hook for fetching admin stats via edge function
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      try {
        const token = await getAuthToken();
        
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        const { data, error } = await supabase.functions.invoke('admin-get-stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (error) throw error;
        
        return data.stats as AdminStats;
      } catch (error) {
        console.error('Error in useAdminStats:', error);
        throw error;
      }
    },
  });
};
