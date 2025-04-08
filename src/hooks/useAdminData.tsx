
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

// Hook for fetching brewery claims
export const useBreweryClaims = () => {
  return useQuery({
    queryKey: ['admin', 'brewery-claims'],
    queryFn: async () => {
      try {
        // Fetch claims
        const { data: claims, error } = await supabase
          .from('brewery_claims')
          .select('*');

        if (error) throw error;
        
        if (!claims || claims.length === 0) {
          return [];
        }

        // Get brewery names and user names in separate queries
        const breweryIds = claims.map(claim => claim.brewery_id);
        const userIds = claims.map(claim => claim.user_id);
        
        // Fetch brewery names
        const { data: breweries, error: breweriesError } = await supabase
          .from('breweries')
          .select('id, name')
          .in('id', breweryIds);
          
        if (breweriesError) {
          console.error('Error fetching breweries:', breweriesError);
        }
        
        // Fetch user names
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }
        
        // Create maps for easy lookup
        const breweryMap = new Map();
        if (breweries) {
          breweries.forEach(brewery => {
            breweryMap.set(brewery.id, brewery.name);
          });
        }
        
        const userMap = new Map();
        if (profiles) {
          profiles.forEach(profile => {
            userMap.set(profile.id, 
              profile.first_name && profile.last_name 
                ? `${profile.first_name} ${profile.last_name}` 
                : 'Unknown User');
          });
        }
        
        // Enhance claims with names
        const enhancedClaims = claims.map(claim => ({
          ...claim,
          brewery_name: breweryMap.get(claim.brewery_id) || 'Unknown Brewery',
          user_name: userMap.get(claim.user_id) || 'Unknown User'
        }));

        return enhancedClaims as BreweryClaim[];
      } catch (error) {
        console.error('Error in useBreweryClaims:', error);
        throw error;
      }
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
      if (status === 'approved' && data && data.length > 0) {
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
      
      return data && data.length > 0 ? data[0] as BreweryClaim : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brewery-claims'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (error) => {
      toast.error(`Failed to update claim: ${error.message}`);
    }
  });
};

// Hook for fetching users
export const useUsers = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const query = useQuery({
    queryKey: ['admin', 'users', searchQuery],
    queryFn: async () => {
      try {
        let queryBuilder = supabase
          .from('profiles')
          .select('id, user_type, first_name, last_name, created_at');
          
        // Add search filter if searchQuery is provided
        if (searchQuery && searchQuery.trim() !== '') {
          queryBuilder = queryBuilder.or(
            `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`
          );
        }
        
        const { data, error } = await queryBuilder;
          
        if (error) {
          console.error('Error fetching users:', error);
          throw error;
        }
        
        return data as UserData[];
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
      
      return data && data.length > 0 ? data[0] : null;
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
      try {
        // Get all breweries
        let queryBuilder = supabase
          .from('breweries')
          .select('id, name, brewery_type, is_verified, website_url, created_at');
          
        // Add search filter if searchQuery is provided
        if (searchQuery && searchQuery.trim() !== '') {
          queryBuilder = queryBuilder.ilike('name', `%${searchQuery}%`);
        }
        
        const { data: breweries, error } = await queryBuilder;
          
        if (error) {
          console.error('Error fetching breweries:', error);
          throw error;
        }
        
        if (!breweries || breweries.length === 0) {
          return [];
        }
        
        // Get venue counts in a separate query
        const breweryIds = breweries.map(brewery => brewery.id);
        
        const { data: venues, error: venuesError } = await supabase
          .from('venues')
          .select('brewery_id')
          .in('brewery_id', breweryIds);
          
        if (venuesError) {
          console.error('Error fetching venues:', venuesError);
        }
        
        // Count venues per brewery
        const venueCounts = new Map();
        if (venues) {
          venues.forEach(venue => {
            venueCounts.set(
              venue.brewery_id, 
              (venueCounts.get(venue.brewery_id) || 0) + 1
            );
          });
        }
        
        // Get brewery owners
        const { data: owners, error: ownersError } = await supabase
          .from('brewery_owners')
          .select('brewery_id, user_id')
          .in('brewery_id', breweryIds);
          
        if (ownersError) {
          console.error('Error fetching brewery owners:', ownersError);
        }
        
        // Group owners by brewery
        const breweryOwners = new Map();
        if (owners) {
          owners.forEach(owner => {
            if (!breweryOwners.has(owner.brewery_id)) {
              breweryOwners.set(owner.brewery_id, []);
            }
            breweryOwners.get(owner.brewery_id).push(owner.user_id);
          });
        }
        
        // Get owner names
        const allOwnerIds = (owners || []).map(owner => owner.user_id);
        
        const { data: ownerProfiles, error: profilesError } = 
          allOwnerIds.length > 0 
            ? await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .in('id', allOwnerIds)
            : { data: [], error: null };
            
        if (profilesError) {
          console.error('Error fetching owner profiles:', profilesError);
        }
        
        // Create map of owner IDs to names
        const ownerNames = new Map();
        if (ownerProfiles) {
          ownerProfiles.forEach(profile => {
            ownerNames.set(
              profile.id, 
              profile.first_name && profile.last_name 
                ? `${profile.first_name} ${profile.last_name}`.trim()
                : 'Unknown'
            );
          });
        }
        
        // Enhance breweries with venue counts and owner names
        const enhancedBreweries = breweries.map(brewery => {
          const breweryOwnerIds = breweryOwners.get(brewery.id) || [];
          const ownerNamesList = breweryOwnerIds.map(id => ownerNames.get(id) || 'Unknown');
          
          return {
            ...brewery,
            venue_count: venueCounts.get(brewery.id) || 0,
            owner_name: ownerNamesList.join(', ') || 'No owner'
          };
        });
        
        return enhancedBreweries as BreweryData[];
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
      
      return data && data.length > 0 ? data[0] : null;
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
      try {
        // Get counts from different tables with separate queries
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (usersError) {
          console.error('Error counting users:', usersError);
          throw usersError;
        }
          
        const { count: breweriesCount, error: breweriesError } = await supabase
          .from('breweries')
          .select('*', { count: 'exact', head: true });
          
        if (breweriesError) {
          console.error('Error counting breweries:', breweriesError);
          throw breweriesError;
        }
          
        const { count: pendingClaimsCount, error: claimsError } = await supabase
          .from('brewery_claims')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
          
        if (claimsError) {
          console.error('Error counting pending claims:', claimsError);
          throw claimsError;
        }
        
        return {
          totalUsers: usersCount || 0,
          totalBreweries: breweriesCount || 0,
          pendingClaims: pendingClaimsCount || 0
        } as AdminStats;
      } catch (error) {
        console.error('Error in useAdminStats:', error);
        throw error;
      }
    },
  });
};
