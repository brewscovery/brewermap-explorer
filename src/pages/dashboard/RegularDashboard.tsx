import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { CountryBreakdownChart } from '@/components/dashboard/analytics/CountryBreakdownChart';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FloatingSidebarToggle } from '@/components/ui/FloatingSidebarToggle';
import { PanelLeft } from '@/components/ui/PanelLeft';

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
      {/* Visual toggle comparison */}
      <div className="mb-8 bg-muted/30 p-4 rounded-lg border border-dashed border-muted-foreground/30">
        <h3 className="text-sm font-medium mb-2">Sidebar Toggle Position Comparison:</h3>
        <div className="relative h-[300px] border rounded-lg bg-background overflow-hidden">
          {/* Mockup header */}
          <div className="w-full h-[70px] border-b bg-card flex items-center px-4">
            <div className="w-32 h-5 bg-muted rounded"></div>
          </div>
          
          {/* Mockup content */}
          <div className="p-4">
            <div className="w-full h-6 bg-muted rounded mb-2"></div>
            <div className="w-2/3 h-6 bg-muted rounded mb-4"></div>
            <div className="w-full h-32 bg-muted/50 rounded"></div>
          </div>
          
          {/* Top left toggle */}
          <div className="absolute left-4 top-[86px] w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
            <PanelLeft className="h-4 w-4 text-primary-foreground" />
          </div>
          
          {/* Bottom left toggle */}
          <div className="absolute left-4 bottom-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center shadow-md">
            <PanelLeft className="h-4 w-4 rotate-180" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Top-left position (gold): More discoverable, close to navigation controls<br/>
          Bottom-left position (gray): Current position, less likely to interfere with content
        </p>
      </div>

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
