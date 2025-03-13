
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
      
      const { data, error } = await supabase
        .from('checkins')
        .select('venue_id, rating')
        .in('venue_id', venueIds);
      
      if (error) {
        console.error('Error fetching venue ratings:', error);
        throw error;
      }
      
      // Process the data to calculate average ratings and total check-ins
      const ratingsByVenue: Record<string, { sum: number; count: number }> = {};
      
      data.forEach(checkin => {
        if (!checkin.venue_id || checkin.rating === null) return;
        
        if (!ratingsByVenue[checkin.venue_id]) {
          ratingsByVenue[checkin.venue_id] = { sum: 0, count: 0 };
        }
        
        ratingsByVenue[checkin.venue_id].sum += checkin.rating;
        ratingsByVenue[checkin.venue_id].count += 1;
      });
      
      // Convert to the expected return format
      const result: VenueRatingData[] = Object.entries(ratingsByVenue).map(([venue_id, { sum, count }]) => ({
        venue_id,
        average_rating: count > 0 ? Number((sum / count).toFixed(1)) : 0,
        total_checkins: count
      }));
      
      return result;
    },
    enabled: venueIds.length > 0,
  });
  
  return {
    ratingsData: ratingsData || [],
    isLoading,
    error,
    getRatingData: (venueId: string) => {
      return ratingsData?.find(data => data.venue_id === venueId) || { 
        venue_id: venueId, 
        average_rating: 0, 
        total_checkins: 0 
      };
    }
  };
};
