
import React from 'react';
import type { Brewery } from '@/types/brewery';
import { useVenueAnalytics } from '@/hooks/useVenueAnalytics';
import { AnalyticsLoadingState } from './analytics/AnalyticsLoadingState';
import { AnalyticsEmptyState } from './analytics/AnalyticsEmptyState';
import { AnalyticsMetricsCards } from './analytics/AnalyticsMetricsCards';
import { VenueBreakdownSection } from './analytics/VenueBreakdownSection';

interface VenueAnalyticsProps {
  brewery: Brewery;
}

export const VenueAnalytics = ({ brewery }: VenueAnalyticsProps) => {
  const { data: metrics, isLoading } = useVenueAnalytics(brewery);

  if (isLoading) {
    return <AnalyticsLoadingState />;
  }

  if (!metrics || metrics.length === 0) {
    return <AnalyticsEmptyState />;
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
      allTopEvents: [...acc.allTopEvents, ...venue.topEvents]
    };
  }, {
    totalWeeklyCheckIns: 0,
    averageRating: null as number | null,
    totalFavorites: 0,
    allTopEvents: [] as Array<{id: string; title: string; interestCount: number}>
  });

  // Get top events across all venues
  const topEventsOverall = overallMetrics.allTopEvents
    .sort((a, b) => b.interestCount - a.interestCount)
    .slice(0, 3);

  console.log('🏢 Overall metrics calculated:', overallMetrics);

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Analytics Overview</h3>
        <p className="text-sm text-muted-foreground">
          Performance metrics across all venues for {brewery.name}
        </p>
      </div>

      <AnalyticsMetricsCards
        averageRating={overallMetrics.averageRating}
        totalWeeklyCheckIns={overallMetrics.totalWeeklyCheckIns}
        totalFavorites={overallMetrics.totalFavorites}
        topEvents={topEventsOverall}
      />

      <VenueBreakdownSection metrics={metrics} />
    </div>
  );
};
