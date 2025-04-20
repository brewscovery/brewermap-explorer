
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Venue } from '@/types/venue';

export const useCreateVenue = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const createVenue = async (venueData: Partial<Venue>) => {
    if (!venueData.brewery_id) {
      toast.error('Brewery ID is required');
      return null;
    }

    if (!venueData.name || !venueData.city || !venueData.state) {
      toast.error('Venue name, city, and state are required');
      return null;
    }

    // First, check if the brewery is verified
    const { data: breweryData, error: breweryError } = await supabase
      .from('breweries')
      .select('is_verified')
      .eq('id', venueData.brewery_id)
      .single();

    if (breweryError) {
      console.error('Error checking brewery verification:', breweryError);
      toast.error('Unable to verify brewery status');
      return null;
    }

    // If brewery is not verified, prevent venue creation
    if (!breweryData.is_verified) {
      toast.error('Venues can only be added to verified breweries');
      return null;
    }

    setIsLoading(true);
    setIsPending(true);

    try {
      // Prepare the venue data with required fields
      const venueInsertData = {
        brewery_id: venueData.brewery_id,
        name: venueData.name,
        city: venueData.city,
        state: venueData.state,
        street: venueData.street || null,
        postal_code: venueData.postal_code || null,
        country: venueData.country || null,
        phone: venueData.phone || null,
        longitude: venueData.longitude || null,
        latitude: venueData.latitude || null
      };

      const { data, error } = await supabase
        .from('venues')
        .insert(venueInsertData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Venue created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating venue:', error);
      toast.error(`Failed to create venue: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
      setIsPending(false);
    }
  };

  return {
    createVenue,
    isLoading,
    isPending,
    mutateAsync: createVenue // Add this for compatibility with mutateAsync pattern
  };
};
