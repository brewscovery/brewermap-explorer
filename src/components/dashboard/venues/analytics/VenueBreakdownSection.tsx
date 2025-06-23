
import React from 'react';
import { Card } from '@/components/ui/card';

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

interface VenueBreakdownSectionProps {
  metrics: VenueMetrics[];
}

export const VenueBreakdownSection = ({ metrics }: VenueBreakdownSectionProps) => {
  if (metrics.length <= 1) {
    return null;
  }

  return (
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
  );
};
