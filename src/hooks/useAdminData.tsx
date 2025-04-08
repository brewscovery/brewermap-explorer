
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
  } | null;
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
  email: string | null;
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
  venues: {
    count: number;
  };
  owners: {
    user_id: string;
    user?: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  }[];
}

// Hook for fetching brewery claims
export const useBreweryClaims = () => {
  return useQuery({
    queryKey: ['admin', 'brewery-claims'],
    queryFn: async () => {
      try {
        // Fetch claims
        const { data: claims, error: claimsError } = await supabase
          .from('brewery_claims')
          .select('*');

        if (claimsError) throw claimsError;

        // Fetch breweries and profiles separately to avoid RLS recursion
        const breweriesMap = new Map();
        const usersMap = new Map();
        
        if (claims && claims.length > 0) {
          // Get brewery IDs and user IDs from claims
          const breweryIds = claims.map(claim => claim.brewery_id);
          const userIds = claims.map(claim => claim.user_id);
          
          // Fetch breweries data
          if (breweryIds.length > 0) {
            const { data: breweries } = await supabase
              .from('breweries')
              .select('id, name')
              .in('id', breweryIds);
              
            if (breweries) {
              breweries.forEach(brewery => {
                breweriesMap.set(brewery.id, brewery);
              });
            }
          }
          
          // Fetch profiles data
          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, first_name, last_name')
              .in('id', userIds);
              
            if (profiles) {
              profiles.forEach(profile => {
                usersMap.set(profile.id, profile);
              });
            }
          }
        }
        
        // Map the results to the expected format
        const claimsWithDetails = claims.map(claim => ({
          ...claim,
          brewery: breweriesMap.get(claim.brewery_id) ? { name: breweriesMap.get(claim.brewery_id).name } : { name: 'Unknown Brewery' },
          user: usersMap.get(claim.user_id) ? {
            first_name: usersMap.get(claim.user_id).first_name,
            last_name: usersMap.get(claim.user_id).last_name,
            email: null // We don't have direct access to emails
          } : null
        }));

        return claimsWithDetails as BreweryClaim[];
      } catch (error) {
        console.error('Error fetching brewery claims:', error);
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
      
      return (data && data.length > 0) ? (data[0] as unknown as BreweryClaim) : null;
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
      try {
        let queryBuilder = supabase
          .from('profiles')
          .select('*');
          
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
        
        // Process the data with default values for missing fields
        const processedUsers = data.map(profile => {
          return {
            ...profile,
            email: null, // We don't have direct access to emails
            created_at: profile.created_at || new Date().toISOString()
          };
        });
        
        return processedUsers as UserData[];
      } catch (error) {
        console.error('Error in useUsers:', error);
        throw error;
      }
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
      try {
        // First, get all breweries
        let queryBuilder = supabase
          .from('breweries')
          .select('*');
          
        // Add search filter if searchQuery is provided
        if (searchQuery) {
          queryBuilder = queryBuilder.ilike('name', `%${searchQuery}%`);
        }
        
        const { data: breweries, error } = await queryBuilder;
          
        if (error) {
          console.error('Error fetching breweries:', error);
          throw error;
        }
        
        // Get brewery owners (separate query to avoid RLS recursion)
        const { data: owners } = await supabase
          .from('brewery_owners')
          .select('brewery_id, user_id');
        
        // Create a map of brewery IDs to owners
        const ownersMap = new Map();
        if (owners) {
          owners.forEach(owner => {
            if (!ownersMap.has(owner.brewery_id)) {
              ownersMap.set(owner.brewery_id, []);
            }
            ownersMap.get(owner.brewery_id).push(owner);
          });
        }
        
        // Get venue counts for each brewery (separate query)
        const breweriesWithDetails = await Promise.all(
          breweries.map(async (brewery) => {
            // Count venues for this brewery
            const { count, error: venueError } = await supabase
              .from('venues')
              .select('*', { count: 'exact', head: true })
              .eq('brewery_id', brewery.id);
            
            if (venueError) {
              console.error('Error counting venues:', venueError);
            }
            
            // Get owner information
            const breweryOwners = ownersMap.get(brewery.id) || [];
            let enrichedOwners = breweryOwners;
            
            if (breweryOwners.length > 0) {
              const ownerIds = breweryOwners.map(owner => owner.user_id);
              
              const { data: ownerProfiles } = await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .in('id', ownerIds);
                
              if (ownerProfiles) {
                const ownerProfilesMap = new Map();
                ownerProfiles.forEach(profile => {
                  ownerProfilesMap.set(profile.id, profile);
                });
                
                enrichedOwners = breweryOwners.map(owner => ({
                  ...owner,
                  user: ownerProfilesMap.get(owner.user_id) || null
                }));
              }
            }
            
            return {
              ...brewery,
              venues: {
                count: count || 0
              },
              owners: enrichedOwners
            };
          })
        );
        
        return breweriesWithDetails as BreweryData[];
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
      try {
        // Get counts from different tables with separate queries
        const usersPromise = supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        const breweriesPromise = supabase
          .from('breweries')
          .select('*', { count: 'exact', head: true });
          
        const pendingClaimsPromise = supabase
          .from('brewery_claims')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
          
        // Execute all queries in parallel
        const [
          { count: usersCount, error: usersError },
          { count: breweriesCount, error: breweriesError },
          { count: pendingClaimsCount, error: claimsError }
        ] = await Promise.all([
          usersPromise,
          breweriesPromise,
          pendingClaimsPromise
        ]);
          
        if (usersError || breweriesError || claimsError) {
          console.error('Error fetching admin stats:', usersError || breweriesError || claimsError);
          throw usersError || breweriesError || claimsError;
        }
        
        return {
          totalUsers: usersCount || 0,
          totalBreweries: breweriesCount || 0,
          pendingClaims: pendingClaimsCount || 0
        };
      } catch (error) {
        console.error('Error in useAdminStats:', error);
        throw error;
      }
    },
  });
};
