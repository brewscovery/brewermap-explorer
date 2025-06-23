
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Brewery } from '@/types/brewery';

interface VenueMetrics {
  venueId: string;
  venueName: string;
  rollingAverageRating: number | null;
  weeklyUniqueCheckIns: number;
  totalFavorites: number;
  topEvents: Array<{
    id: string;
    title: string;
    interestCount: number;
  }>;
}

export const useVenueAnalytics = (brewery: Brewery) => {
  return useQuery({
    queryKey: ['venue-analytics', brewery.id],
    queryFn: async (): Promise<VenueMetrics[]> => {
      console.log('🏢 Starting venue analytics fetch for brewery:', brewery.id);
      
      // Get all venues for this brewery
      const { data: venues, error: venuesError } = await supabase
        .from('venues')
        .select('id, name')
        .eq('brewery_id', brewery.id);

      if (venuesError) {
        console.error('❌ Error fetching venues:', venuesError);
        throw venuesError;
      }
      
      console.log('🏢 Found venues:', venues);
      
      if (!venues || venues.length === 0) {
        console.log('🏢 No venues found for brewery');
        return [];
      }

      const venueIds = venues.map(v => v.id);
      console.log('🏢 Venue IDs:', venueIds);

      // Get rolling average rating (last 20 check-ins per venue)
      const ratingsPromises = venues.map(async (venue) => {
        console.log(`📊 Fetching ratings for venue ${venue.name} (${venue.id})`);
        const { data: recentCheckIns, error: ratingsError } = await supabase
          .from('checkins')
          .select('rating')
          .eq('venue_id', venue.id)
          .not('rating', 'is', null)
          .order('visited_at', { ascending: false })
          .limit(20);

        if (ratingsError) {
          console.error(`❌ Error fetching ratings for venue ${venue.id}:`, ratingsError);
        }
        
        console.log(`📊 Recent check-ins for ${venue.name}:`, recentCheckIns);
        
        const ratings = recentCheckIns?.map(c => c.rating).filter(r => r !== null) || [];
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
          : null;

        console.log(`📊 Average rating for ${venue.name}: ${avgRating} (from ${ratings.length} ratings)`);
        return { venueId: venue.id, avgRating };
      });

      const ratingsResults = await Promise.all(ratingsPromises);
      console.log('📊 All ratings results:', ratingsResults);

      // Get weekly unique check-ins (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      console.log('📅 Week ago date:', weekAgo.toISOString());

      const weeklyCheckInsPromises = venues.map(async (venue) => {
        console.log(`📈 Fetching weekly check-ins for venue ${venue.name} (${venue.id})`);
        const { data: uniqueUsers, error: checkInsError } = await supabase
          .from('checkins')
          .select('user_id')
          .eq('venue_id', venue.id)
          .gte('visited_at', weekAgo.toISOString());

        if (checkInsError) {
          console.error(`❌ Error fetching check-ins for venue ${venue.id}:`, checkInsError);
        }
        
        console.log(`📈 Weekly check-ins for ${venue.name}:`, uniqueUsers);

        // Count unique users manually
        const uniqueUserIds = [...new Set(uniqueUsers?.map(c => c.user_id) || [])];
        console.log(`📈 Unique users for ${venue.name}: ${uniqueUserIds.length}`);
        return { venueId: venue.id, count: uniqueUserIds.length };
      });

      const weeklyCheckInsResults = await Promise.all(weeklyCheckInsPromises);
      console.log('📈 All weekly check-ins results:', weeklyCheckInsResults);

      // Get total favorites per venue - Now should work with RLS policies
      const favoritesPromises = venues.map(async (venue) => {
        console.log(`❤️ Fetching favorites for venue ${venue.name} (${venue.id})`);
        
        const { data: favorites, error: favoritesError } = await supabase
          .from('venue_favorites')
          .select('id')
          .eq('venue_id', venue.id);

        if (favoritesError) {
          console.error(`❌ Error fetching favorites for venue ${venue.id}:`, favoritesError);
          return { venueId: venue.id, count: 0 };
        }
        
        console.log(`❤️ Favorites for ${venue.name}:`, favorites);
        const count = favorites?.length || 0;
        console.log(`❤️ Favorites count for ${venue.name}: ${count}`);
        return { venueId: venue.id, count };
      });

      const favoritesResults = await Promise.all(favoritesPromises);
      console.log('❤️ All favorites results:', favoritesResults);

      // Get top 3 events with most interest per venue
      const eventsPromises = venues.map(async (venue) => {
        console.log(`🎉 Fetching events for venue ${venue.name} (${venue.id})`);
        const { data: events, error: eventsError } = await supabase
          .from('venue_events')
          .select(`
            id,
            title,
            event_interests(id)
          `)
          .eq('venue_id', venue.id)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (eventsError) {
          console.error(`❌ Error fetching events for venue ${venue.id}:`, eventsError);
        }
        
        console.log(`🎉 Events for ${venue.name}:`, events);

        const eventsWithCounts = events?.map(event => ({
          id: event.id,
          title: event.title,
          interestCount: Array.isArray(event.event_interests) ? event.event_interests.length : 0
        })) || [];

        console.log(`🎉 Events with counts for ${venue.name}:`, eventsWithCounts);

        const topEvents = eventsWithCounts
          .sort((a, b) => b.interestCount - a.interestCount)
          .slice(0, 3);

        console.log(`🎉 Top events for ${venue.name}:`, topEvents);
        return { venueId: venue.id, topEvents };
      });

      const eventsResults = await Promise.all(eventsPromises);
      console.log('🎉 All events results:', eventsResults);

      // Combine all metrics
      const finalMetrics = venues.map(venue => {
        const ratingData = ratingsResults.find(r => r.venueId === venue.id);
        const checkInsData = weeklyCheckInsResults.find(c => c.venueId === venue.id);
        const favoritesData = favoritesResults.find(f => f.venueId === venue.id);
        const eventsData = eventsResults.find(e => e.venueId === venue.id);

        const venueMetrics = {
          venueId: venue.id,
          venueName: venue.name,
          rollingAverageRating: ratingData?.avgRating || null,
          weeklyUniqueCheckIns: checkInsData?.count || 0,
          totalFavorites: favoritesData?.count || 0,
          topEvents: eventsData?.topEvents || []
        };
        
        console.log(`🏢 Final metrics for ${venue.name}:`, venueMetrics);
        return venueMetrics;
      });

      console.log('🏢 All final metrics:', finalMetrics);
      return finalMetrics;
    },
    enabled: !!brewery.id
  });
};
