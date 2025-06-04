
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { StateBreakdownChart } from '@/components/dashboard/analytics/StateBreakdownChart';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const RegularDashboard = () => {
  const { user, firstName, lastName } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<string>('United States');
  const { data: analytics, isLoading } = useUserAnalytics(user?.id, selectedCountry);
  
  const displayName = firstName || lastName 
    ? `${firstName || ''} ${lastName || ''}`.trim()
    : 'User';
    
  const progressPercentage = analytics 
    ? (analytics.uniqueVenuesVisited / analytics.totalVenues) * 100
    : 0;

  // Update selected country when analytics data loads for the first time
  React.useEffect(() => {
    if (analytics?.availableCountries?.length && !analytics.availableCountries.includes(selectedCountry)) {
      setSelectedCountry(analytics.availableCountries[0]);
    }
  }, [analytics?.availableCountries, selectedCountry]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {displayName}</CardTitle>
          <CardDescription>
            Your personalized brewery dashboard
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Journey in {selectedCountry}</CardTitle>
            <CardDescription>
              Track your progress visiting unique venues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  You've visited {analytics?.uniqueVenuesVisited || 0} out of {analytics?.totalVenues || 0} venues in {selectedCountry}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <StateBreakdownChart 
          data={analytics?.venuesByState || []}
          isLoading={isLoading}
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          availableCountries={analytics?.availableCountries || []}
        />
      </div>
    </div>
  );
};

export default RegularDashboard;
