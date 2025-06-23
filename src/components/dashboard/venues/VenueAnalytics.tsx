
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, Calendar, Heart, Star } from 'lucide-react';
import type { Brewery } from '@/types/brewery';

interface VenueAnalyticsProps {
  brewery: Brewery;
}

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

export const VenueAnalytics = ({ brewery }: VenueAnalyticsProps) => {
  const { data: metrics, isLoading } = useQuery({
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

      // Get total favorites per venue
      const favoritesPromises = venues.map(async (venue) => {
        console.log(`❤️ Fetching favorites for venue ${venue.name} (${venue.id})`);
        const { data: favorites, error: favoritesError } = await supabase
          .from('venue_favorites')
          .select('id')
          .eq('venue_id', venue.id);

        if (favoritesError) {
          console.error(`❌ Error fetching favorites for venue ${venue.id}:`, favoritesError);
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

  if (isLoading) {
    return (
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold">Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Analytics</h3>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No analytics data available yet. Add some venues to see metrics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate overall metrics across all venues
  const overallMetrics = metrics.reduce((acc, venue) => {
    const validRatings = metrics.filter(v => v.rollingAverageRating !== null);
    const avgRating = validRatings.length > 0 
      ? validRatings.reduce((sum, v) => sum + (v.rollingAverageRating || 0), 0) / validRatings.length 
      : null;

    return {
      totalWeeklyCheckIns: acc.totalWeeklyCheckIns + venue.weeklyUniqueCheckIns,
      averageRating: avgRating,
      totalFavorites: acc.totalFavorites + venue.totalFavorites,
      totalTopEvents: acc.totalTopEvents + venue.topEvents.length
    };
  }, {
    totalWeeklyCheckIns: 0,
    averageRating: null as number | null,
    totalFavorites: 0,
    totalTopEvents: 0
  });

  console.log('🏢 Overall metrics calculated:', overallMetrics);

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Analytics Overview</h3>
        <p className="text-sm text-muted-foreground">
          Performance metrics across all venues for {brewery.name}
        </p>
      </div>

      {/* Overall Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallMetrics.averageRating 
                ? overallMetrics.averageRating.toFixed(1) 
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 20 check-ins per venue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Check-ins</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalWeeklyCheckIns}</div>
            <p className="text-xs text-muted-foreground">
              Unique users, last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalFavorites}</div>
            <p className="text-xs text-muted-foreground">
              Users who favorited venues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Events</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalTopEvents}</div>
            <p className="text-xs text-muted-foreground">
              Top events with interest
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-Venue Breakdown */}
      {metrics.length > 1 && (
        <div className="space-y-4">
          <h4 className="font-medium">Per-Venue Breakdown</h4>
          <div className="space-y-3">
            {metrics.map(venue => (
              <Card key={venue.venueId} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-medium">{venue.venueName}</h5>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Avg Rating</p>
                    <p className="font-medium">
                      {venue.rollingAverageRating 
                        ? venue.rollingAverageRating.toFixed(1) 
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weekly Check-ins</p>
                    <p className="font-medium">{venue.weeklyUniqueCheckIns}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Favorites</p>
                    <p className="font-medium">{venue.totalFavorites}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Top Events</p>
                    {venue.topEvents.length > 0 ? (
                      <div className="space-y-1">
                        {venue.topEvents.map((event, index) => (
                          <p key={event.id} className="font-medium text-xs">
                            {index + 1}. {event.title} ({event.interestCount})
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="font-medium">None</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
