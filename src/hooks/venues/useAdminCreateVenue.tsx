
import { useState } from 'react';
import { callEdgeFunction } from '@/utils/adminApiUtils';
import { toast } from 'sonner';
import type { Venue } from '@/types/venue';

export const useAdminCreateVenue = () => {
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

    setIsLoading(true);
    setIsPending(true);

    try {
      const result = await callEdgeFunction('admin-brewery-operations', {
        operation: 'createVenue',
        venueData
      });

      toast.success('Venue created successfully');
      return result.venue;
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
