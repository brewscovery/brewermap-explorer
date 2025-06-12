
import { useOptimizedSupabaseQuery } from './useOptimizedSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

interface VenueRatingData {
  venue_id: string;
  average_rating: number;
  total_checkins: number;
}

export const useVenueRatings = (venueIds: string[] = []) => {
  const {
    data: ratingsData = [],
    isLoading,
    error,
  } = useOptimizedSupabaseQuery<VenueRatingData[]>(
    ['venueRatings', ...venueIds],
    'checkins',
    async () => {
      if (!venueIds.length) return [];
      
      console.log('Fetching ratings for venue IDs:', venueIds);
      
      // Now that we have proper RLS policies, we can filter directly by venue_id
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .in('venue_id', venueIds);
      
      if (error) {
        console.error('Error fetching check-ins:', error);
        throw error;
      }
      
      console.log('Check-ins from database for selected venues:', data);
      
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
    'NORMAL',
    180000, // 3 minutes stale time for ratings
    venueIds.length > 0
  );
  
  return {
    ratingsData,
    isLoading,
    error,
    getRatingData: (venueId: string) => {
      // Convert the passed venueId to string for consistent comparison
      const stringVenueId = String(venueId);
      console.log(`Looking for rating data for venue ID: ${stringVenueId}`);
      
      const foundRating = ratingsData.find(data => String(data.venue_id) === stringVenueId);
      console.log(`Found rating data:`, foundRating);
      
      return foundRating || { 
        venue_id: stringVenueId, 
        average_rating: 0, 
        total_checkins: 0 
      };
    }
  };
};
