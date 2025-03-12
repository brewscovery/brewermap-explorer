
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';
import { toast } from 'sonner';

export const useBreweryVenues = (breweryId: string | null) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

  return {
    venues: venues || [],
    isLoading,
    error,
    refetch,
    isDeleting,
    isUpdating,
    updateVenue
  };
};
