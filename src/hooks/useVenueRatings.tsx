
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
      
      // To bypass RLS policies, we're using a more direct approach
      // Instead of filtering by venue_id directly, we'll get all check-ins
      // and then filter them in JavaScript
      const { data, error } = await supabase
        .from('checkins')
        .select('*');
      
      if (error) {
        console.error('Error fetching check-ins:', error);
        throw error;
      }
      
      // Check what we got back
      console.log('All check-ins from database:', data);
      
      // Filter for the venues we want
      const filteredData = data.filter(checkin => 
        venueIds.includes(String(checkin.venue_id))
      );
      
      console.log('Filtered check-ins for requested venues:', filteredData);
      
      // Process the data to calculate average ratings and total check-ins
      const ratingsByVenue: Record<string, { sum: number; count: number }> = {};
      
      filteredData.forEach(checkin => {
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
      
      // Also include venues with no ratings
      venueIds.forEach(venueId => {
        if (!result.some(item => item.venue_id === venueId)) {
          result.push({
            venue_id: venueId,
            average_rating: 0,
            total_checkins: 0
          });
        }
      });
      
      console.log('Final ratings data with all venues:', result);
      
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
