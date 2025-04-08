
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
  brewery?: {
    name: string;
  };
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

// Type for admin dashboard stats
export interface AdminStats {
  totalUsers: number;
  totalBreweries: number;
  pendingClaims: number;
}

// Hook for fetching brewery claims
export const useBreweryClaims = () => {
  return useQuery({
    queryKey: ['admin', 'brewery-claims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brewery_claims')
        .select(`
          *,
          brewery:brewery_id (name),
          user:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching brewery claims:', error);
        throw error;
      }
      
      return data as BreweryClaim[];
    },
  });
};

// Hook for updating a brewery claim
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
      const updates = {
        status,
        admin_notes: adminNotes,
        decision_at: status !== 'pending' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('brewery_claims')
        .update(updates)
        .eq('id', claimId)
        .select();
        
      if (error) {
        console.error('Error updating brewery claim:', error);
        throw error;
      }

      // If the claim was approved, handle brewery ownership
      if (status === 'approved') {
        const claim = data[0] as BreweryClaim;
        
        // Update brewery verification status
        const { error: breweryError } = await supabase
          .from('breweries')
          .update({ is_verified: true })
          .eq('id', claim.brewery_id);
          
        if (breweryError) {
          console.error('Error updating brewery verification:', breweryError);
          throw breweryError;
        }
        
        // Create brewery owner relationship
        const { error: ownerError } = await supabase
          .from('brewery_owners')
          .insert({
            brewery_id: claim.brewery_id,
            user_id: claim.user_id
          });
          
        if (ownerError) {
          console.error('Error creating brewery owner:', ownerError);
          throw ownerError;
        }
      }
      
      return data[0] as BreweryClaim;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brewery-claims'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    }
  });
};

// Hook for fetching users
export const useUsers = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const query = useQuery({
    queryKey: ['admin', 'users', searchQuery],
    queryFn: async () => {
      let queryBuilder = supabase
        .from('profiles')
        .select('*, auth_user:id (email)');
        
      // Add search filter if searchQuery is provided
      if (searchQuery) {
        queryBuilder = queryBuilder.or(
          `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`
        );
      }
      
      const { data, error } = await queryBuilder;
        
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      // Get auth user emails separately since we can't join directly
      const userIds = data.map(user => user.id);
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
        perPage: 1000
      });
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        throw authError;
      }
      
      // Merge profile data with auth user data
      const usersWithEmail = data.map(profile => {
        const authUser = authUsers.users.find(user => user.id === profile.id);
        return {
          ...profile,
          email: authUser?.email || ''
        };
      });
      
      return usersWithEmail;
    },
    enabled: true,
  });
  
  return {
    ...query,
    searchQuery,
    setSearchQuery
  };
};

// Hook for updating a user's type
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
      const { data, error } = await supabase
        .from('profiles')
        .update({ user_type: userType })
        .eq('id', userId)
        .select();
        
      if (error) {
        console.error('Error updating user type:', error);
        throw error;
      }
      
      return data[0];
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

// Hook for fetching breweries
export const useBreweries = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const query = useQuery({
    queryKey: ['admin', 'breweries', searchQuery],
    queryFn: async () => {
      let queryBuilder = supabase
        .from('breweries')
        .select(`
          *,
          venues:venues(count),
          owners:brewery_owners(
            user:user_id(
              id,
              first_name,
              last_name
            )
          )
        `);
        
      // Add search filter if searchQuery is provided
      if (searchQuery) {
        queryBuilder = queryBuilder.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error } = await queryBuilder;
        
      if (error) {
        console.error('Error fetching breweries:', error);
        throw error;
      }
      
      return data;
    },
  });
  
  return {
    ...query,
    searchQuery,
    setSearchQuery
  };
};

// Hook for updating a brewery's verification status
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
      const { data, error } = await supabase
        .from('breweries')
        .update({ is_verified: isVerified })
        .eq('id', breweryId)
        .select();
        
      if (error) {
        console.error('Error updating brewery verification:', error);
        throw error;
      }
      
      return data[0];
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

// Hook for fetching admin stats
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      // Get counts from different tables
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      const { count: breweriesCount, error: breweriesError } = await supabase
        .from('breweries')
        .select('*', { count: 'exact', head: true });
        
      const { count: pendingClaimsCount, error: claimsError } = await supabase
        .from('brewery_claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
        
      if (usersError || breweriesError || claimsError) {
        console.error('Error fetching admin stats:', usersError || breweriesError || claimsError);
        throw usersError || breweriesError || claimsError;
      }
      
      return {
        totalUsers: usersCount || 0,
        totalBreweries: breweriesCount || 0,
        pendingClaims: pendingClaimsCount || 0
      };
    },
  });
};
