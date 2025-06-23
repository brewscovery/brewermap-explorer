
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Heart, Calendar, Star } from 'lucide-react';

interface AnalyticsMetricsCardsProps {
  averageRating: number | null;
  totalWeeklyCheckIns: number;
  totalFavorites: number;
  topEvents: Array<{
    id: string;
    title: string;
    interestCount: number;
  }>;
}

export const AnalyticsMetricsCards = ({ 
  averageRating, 
  totalWeeklyCheckIns, 
  totalFavorites, 
  topEvents 
}: AnalyticsMetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {averageRating ? averageRating.toFixed(1) : "—"}
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
          <div className="text-2xl font-bold">{totalWeeklyCheckIns}</div>
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
          <div className="text-2xl font-bold">{totalFavorites}</div>
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
          {topEvents.length > 0 ? (
            <div className="space-y-1">
              {topEvents.map((event, index) => (
                <div key={event.id} className="text-xs">
                  <span className="font-medium">{index + 1}. {event.title}</span>
                  <span className="text-muted-foreground ml-1">({event.interestCount})</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-2xl font-bold">—</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Top events with interest
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
