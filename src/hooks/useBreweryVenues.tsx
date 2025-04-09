
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';
import { toast } from 'sonner';

// Hook for fetching brewery venues
export const useBreweryVenues = (breweryId: string | null) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  const { 
    data: venues, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['breweryVenues', breweryId],
    queryFn: async () => {
      if (!breweryId) return [];
      
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('brewery_id', breweryId)
        .order('name');

      if (error) {
        console.error('Error fetching brewery venues:', error);
        toast.error('Failed to load venues');
        throw error;
      }
      
      return data as Venue[];
    },
    enabled: !!breweryId
  });
  
  // Setup real-time listener for brewery-specific venue changes
  useEffect(() => {
    if (!breweryId) return;
    
    console.log(`Setting up realtime subscription for brewery ${breweryId} venues`);
    
    const breweryVenuesChannel = supabase
      .channel(`brewery-${breweryId}-venues-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'venues',
          filter: `brewery_id=eq.${breweryId}`
        },
        (payload) => {
          console.log(`Venue change detected for brewery ${breweryId}:`, payload);
          
          // Invalidate brewery venues queries
          queryClient.invalidateQueries({ 
            queryKey: ['breweryVenues', breweryId] 
          });
          
          // Also invalidate the general venues query
          queryClient.invalidateQueries({ 
            queryKey: ['venues'] 
          });
        }
      )
      .subscribe((status) => {
        console.log(`Brewery venues channel subscription status:`, status);
      });

    // Store channel reference for cleanup
    channelRef.current = breweryVenuesChannel;
      
    return () => {
      console.log(`Cleaning up realtime subscription for brewery ${breweryId} venues`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [breweryId, queryClient]);
  
  const updateVenue = async (venueId: string, venueData: Partial<Venue>) => {
    if (!breweryId) {
      toast.error('Brewery ID is missing');
      return false;
    }
    
    setIsUpdating(true);
    
    try {
      // First try to geocode the address if there's a street and city
      let longitude = venueData.longitude;
      let latitude = venueData.latitude;

      if (venueData.street && venueData.city && venueData.state) {
        try {
          const geocodeResponse = await supabase.functions.invoke('geocode', {
            body: {
              street: venueData.street,
              city: venueData.city,
              state: venueData.state,
              postalCode: venueData.postal_code
            }
          });

          if (geocodeResponse.data) {
            longitude = geocodeResponse.data.longitude;
            latitude = geocodeResponse.data.latitude;
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          // Continue without coordinates if geocoding fails
        }
      }
      
      const { error } = await supabase
        .from('venues')
        .update({
          ...venueData,
          longitude,
          latitude,
          updated_at: new Date().toISOString()
        })
        .eq('id', venueId)
        .eq('brewery_id', breweryId);

      if (error) throw error;

      toast.success('Venue updated successfully');
      await refetch();
      return true;
    } catch (error: any) {
      console.error('Error updating venue:', error);
      toast.error(error.message || 'Failed to update venue');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteVenue = async (venueId: string) => {
    if (!breweryId) {
      toast.error('Brewery ID is missing');
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', venueId)
        .eq('brewery_id', breweryId);

      if (error) throw error;

      toast.success('Venue deleted successfully');
      await refetch();
      return true;
    } catch (error: any) {
      console.error('Error deleting venue:', error);
      toast.error(error.message || 'Failed to delete venue');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    venues: venues || [],
    isLoading,
    error,
    refetch,
    isDeleting,
    isUpdating,
    updateVenue,
    deleteVenue
  };
};

// Hook for creating a venue
export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (venueData: any) => {
      try {
        console.log('Creating venue with data:', venueData);
        const { data, error } = await supabase
          .from('venues')
          .insert({ 
            ...venueData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating venue:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['breweryVenues', data.brewery_id] });
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
      try {
        console.log('Deleting venue:', venueId);
        // First get the venue to get the brewery_id for cache invalidation
        const { data: venue } = await supabase
          .from('venues')
          .select('brewery_id')
          .eq('id', venueId)
          .single();
        
        const breweryId = venue?.brewery_id;
        
        const { error } = await supabase
          .from('venues')
          .delete()
          .eq('id', venueId);
        
        if (error) throw error;
        
        return { venueId, breweryId };
      } catch (error) {
        console.error('Error deleting venue:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Venue deleted, invalidating queries for brewery:', data.breweryId);
      if (data.breweryId) {
        queryClient.invalidateQueries({ queryKey: ['breweryVenues', data.breweryId] });
      }
      toast.success('Venue deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete venue: ${error.message}`);
    }
  });
};
