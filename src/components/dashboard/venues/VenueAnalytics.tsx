
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
      // Get all venues for this brewery
      const { data: venues, error: venuesError } = await supabase
        .from('venues')
        .select('id, name')
        .eq('brewery_id', brewery.id);

      if (venuesError) throw venuesError;
      if (!venues || venues.length === 0) return [];

      const venueIds = venues.map(v => v.id);

      // Get rolling average rating (last 20 check-ins per venue)
      const ratingsPromises = venues.map(async (venue) => {
        const { data: recentCheckIns } = await supabase
          .from('checkins')
          .select('rating')
          .eq('venue_id', venue.id)
          .not('rating', 'is', null)
          .order('visited_at', { ascending: false })
          .limit(20);

        const ratings = recentCheckIns?.map(c => c.rating).filter(r => r !== null) || [];
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
          : null;

        return { venueId: venue.id, avgRating };
      });

      const ratingsResults = await Promise.all(ratingsPromises);

      // Get weekly unique check-ins (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const weeklyCheckInsPromises = venues.map(async (venue) => {
        const { count } = await supabase
          .from('checkins')
          .select('user_id', { count: 'exact', head: true })
          .eq('venue_id', venue.id)
          .gte('visited_at', weekAgo.toISOString());

        return { venueId: venue.id, count: count || 0 };
      });

      const weeklyCheckInsResults = await Promise.all(weeklyCheckInsPromises);

      // Get total favorites per venue
      const favoritesPromises = venues.map(async (venue) => {
        const { count } = await supabase
          .from('venue_favorites')
          .select('*', { count: 'exact', head: true })
          .eq('venue_id', venue.id);

        return { venueId: venue.id, count: count || 0 };
      });

      const favoritesResults = await Promise.all(favoritesPromises);

      // Get top 3 events with most interest per venue
      const eventsPromises = venues.map(async (venue) => {
        const { data: events } = await supabase
          .from('venue_events')
          .select(`
            id,
            title,
            event_interests(count)
          `)
          .eq('venue_id', venue.id)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        const eventsWithCounts = events?.map(event => ({
          id: event.id,
          title: event.title,
          interestCount: event.event_interests?.length || 0
        })) || [];

        const topEvents = eventsWithCounts
          .sort((a, b) => b.interestCount - a.interestCount)
          .slice(0, 3);

        return { venueId: venue.id, topEvents };
      });

      const eventsResults = await Promise.all(eventsPromises);

      // Combine all metrics
      return venues.map(venue => {
        const ratingData = ratingsResults.find(r => r.venueId === venue.id);
        const checkInsData = weeklyCheckInsResults.find(c => c.venueId === venue.id);
        const favoritesData = favoritesResults.find(f => f.venueId === venue.id);
        const eventsData = eventsResults.find(e => e.venueId === venue.id);

        return {
          venueId: venue.id,
          venueName: venue.name,
          rollingAverageRating: ratingData?.avgRating || null,
          weeklyUniqueCheckIns: checkInsData?.count || 0,
          totalFavorites: favoritesData?.count || 0,
          topEvents: eventsData?.topEvents || []
        };
      });
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
                    <p className="font-medium">
                      {venue.topEvents.length > 0 
                        ? venue.topEvents[0].title + (venue.topEvents.length > 1 ? ` +${venue.topEvents.length - 1}` : '')
                        : "None"}
                    </p>
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
