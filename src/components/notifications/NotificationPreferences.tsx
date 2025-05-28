
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const NotificationPreferences: React.FC = () => {
  const { preferences, isLoading, updatePreferences } = useNotificationPreferences();
  const { userType } = useAuth();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose which notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-11" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  // For business users, only show claim updates
  if (userType === 'business') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose which notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="claim-updates">Brewery Claim Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about the status of your brewery claims
              </p>
            </div>
            <Switch
              id="claim-updates"
              checked={preferences?.claim_updates ?? true}
              onCheckedChange={(checked) => handlePreferenceChange('claim_updates', checked)}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // For regular users, show all preferences except claim updates
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose which notifications you'd like to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="venue-updates">Venue Updates</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when your favorite venues update their hours
            </p>
          </div>
          <Switch
            id="venue-updates"
            checked={preferences?.venue_updates ?? true}
            onCheckedChange={(checked) => handlePreferenceChange('venue_updates', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="event-updates">Event Updates</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about new events at your favorite venues
            </p>
          </div>
          <Switch
            id="event-updates"
            checked={preferences?.event_updates ?? true}
            onCheckedChange={(checked) => handlePreferenceChange('event_updates', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="happy-hour-updates">Happy Hour Updates</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about happy hour changes at your favorite venues
            </p>
          </div>
          <Switch
            id="happy-hour-updates"
            checked={preferences?.happy_hour_updates ?? true}
            onCheckedChange={(checked) => handlePreferenceChange('happy_hour_updates', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="daily-special-updates">Daily Special Updates</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about daily special changes at your favorite venues
            </p>
          </div>
          <Switch
            id="daily-special-updates"
            checked={preferences?.daily_special_updates ?? true}
            onCheckedChange={(checked) => handlePreferenceChange('daily_special_updates', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
