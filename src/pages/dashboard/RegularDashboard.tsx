
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { CountryBreakdownChart } from '@/components/dashboard/analytics/CountryBreakdownChart';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FloatingSidebarToggle } from '@/components/ui/FloatingSidebarToggle';
import { PanelLeft } from 'lucide-react';

const RegularDashboard = () => {
  const { user, firstName, lastName } = useAuth();
  const { data: analytics, isLoading } = useUserAnalytics(user?.id);
  
  const displayName = firstName || lastName 
    ? `${firstName || ''} ${lastName || ''}`.trim()
    : 'User';
    
  const progressPercentage = analytics 
    ? (analytics.uniqueVenuesVisited / analytics.totalVenues) * 100
    : 0;

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
            <CardTitle className="text-lg">Your Journey</CardTitle>
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
                  You've visited {analytics?.uniqueVenuesVisited || 0} out of {analytics?.totalVenues || 0} venues
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <CountryBreakdownChart 
          data={analytics?.venuesByCountry || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default RegularDashboard;
