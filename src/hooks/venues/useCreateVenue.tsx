
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Venue } from '@/types/venue';

export const useCreateVenue = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createVenue = async (venueData: Partial<Venue>) => {
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

    try {
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

      toast.success('Venue created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating venue:', error);
      toast.error(`Failed to create venue: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createVenue,
    isLoading
  };
};
