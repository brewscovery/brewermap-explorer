
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VenueRatingData {
  venue_id: string;
  average_rating: number;
  total_checkins: number;
}

export const useVenueRatings = (venueIds: string[] = []) => {
  const {
    data: ratingsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['venueRatings', venueIds],
    queryFn: async () => {
      if (!venueIds.length) return [];
      
      console.log('Fetching ratings for venue IDs:', venueIds);
      
      // Use a direct public query without any user-specific filtering
      // This avoids potential RLS policy issues
      const { data, error } = await supabase
        .from('checkins')
        .select('venue_id, rating')
        .in('venue_id', venueIds)
        .returns<{ venue_id: string; rating: number | null }[]>();
      
      if (error) {
        console.error('Error fetching venue ratings:', error);
        throw error;
      }
      
      console.log('Raw checkins data for venues:', data);
      
      // Process the data to calculate average ratings and total check-ins
      const ratingsByVenue: Record<string, { sum: number; count: number }> = {};
      
      data.forEach(checkin => {
        // Ensure venue_id exists and rating is not null
        if (!checkin.venue_id || checkin.rating === null) return;
        
        // Convert venue_id to string to ensure consistent comparison
        const venueId = String(checkin.venue_id);
        
        if (!ratingsByVenue[venueId]) {
          ratingsByVenue[venueId] = { sum: 0, count: 0 };
        }
        
        ratingsByVenue[venueId].sum += checkin.rating;
        ratingsByVenue[venueId].count += 1;
      });
      
      console.log('Processed ratings by venue:', ratingsByVenue);
      
      // Convert to the expected return format
      const result: VenueRatingData[] = Object.entries(ratingsByVenue).map(([venue_id, { sum, count }]) => ({
        venue_id,
        average_rating: count > 0 ? Number((sum / count).toFixed(1)) : 0,
        total_checkins: count
      }));
      
      console.log('Final ratings data:', result);
      
      return result;
    },
    enabled: venueIds.length > 0,
  });
  
  return {
    ratingsData: ratingsData || [],
    isLoading,
    error,
    getRatingData: (venueId: string) => {
      // Convert the passed venueId to string for consistent comparison
      const stringVenueId = String(venueId);
      console.log(`Looking for rating data for venue ID: ${stringVenueId}`);
      
      const foundRating = ratingsData?.find(data => String(data.venue_id) === stringVenueId);
      console.log(`Found rating data:`, foundRating);
      
      return foundRating || { 
        venue_id: stringVenueId, 
        average_rating: 0, 
        total_checkins: 0 
      };
    }
  };
};
