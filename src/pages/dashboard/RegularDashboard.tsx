
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { StateBreakdown } from '@/components/dashboard/analytics/StateBreakdown';
import { CountryProgressBars } from '@/components/dashboard/analytics/CountryProgressBars';
import { WeeklyCheckInsChart } from '@/components/dashboard/analytics/WeeklyCheckInsChart';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const RegularDashboard = () => {
  const { user, firstName, lastName } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<string>('United States');
  const { data: analytics, isLoading } = useUserAnalytics(user?.id, selectedCountry);
  
  const displayName = firstName || lastName 
    ? `${firstName || ''}  ${lastName || ''}`.trim()
    : 'User';
    
  // Calculate global progress across all countries
  const globalProgress = analytics?.venuesByCountry 
    ? analytics.venuesByCountry.reduce((acc, country) => ({
        visited: acc.visited + country.visitedCount,
        total: acc.total + country.totalCount
      }), { visited: 0, total: 0 })
    : { visited: 0, total: 0 };
    
  const globalProgressPercentage = globalProgress.total > 0 
    ? (globalProgress.visited / globalProgress.total) * 100 
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
            Your personalized Brewscovery dashboard
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Brewscovery progress</CardTitle>
            <CardDescription>
              Total brewscoveries around the world
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
                <Progress value={globalProgressPercentage} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  You've brewscovered {globalProgress.visited} out of {globalProgress.total} venues worldwide
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <CountryProgressBars 
          data={analytics?.venuesByCountry || []}
          isLoading={isLoading}
          selectedCountry={selectedCountry}
          onCountrySelect={setSelectedCountry}
        />
      </div>

      <StateBreakdown 
        data={analytics?.venuesByState || []}
        isLoading={isLoading}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        availableCountries={analytics?.availableCountries || []}
      />

      <WeeklyCheckInsChart 
        data={analytics?.weeklyCheckIns || []}
        isLoading={isLoading}
      />
      
    </div>
  );
};

export default RegularDashboard;
