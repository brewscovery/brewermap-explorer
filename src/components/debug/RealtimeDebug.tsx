
import React, { useState, useEffect } from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const RealtimeDebug = () => {
  const { getStats } = useRealtime();
  const [stats, setStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const refreshStats = () => {
    setStats(getStats());
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        Debug RT
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 max-h-96 overflow-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Real-time Debug</CardTitle>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
          >
            ×
          </Button>
        </div>
        <CardDescription className="text-xs">
          Active subscriptions and channels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {stats && (
          <>
            <div className="flex gap-2">
              <Badge variant="secondary">
                {stats.subscriptionCount} subs
              </Badge>
              <Badge variant="outline">
                {stats.channelCount} channels
              </Badge>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-xs font-medium">Active Channels:</h4>
              {stats.channels.map((channel: string) => (
                <div key={channel} className="text-xs text-muted-foreground">
                  • {channel}
                </div>
              ))}
            </div>
            
            <div className="space-y-1">
              <h4 className="text-xs font-medium">Subscriptions:</h4>
              {stats.subscriptions.map((sub: any) => (
                <div key={sub.id} className="text-xs text-muted-foreground">
                  • {sub.eventType} {sub.hasFilter && '(filtered)'}
                </div>
              ))}
            </div>
            
            <Button onClick={refreshStats} size="sm" variant="outline" className="w-full">
              Refresh
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RealtimeDebug;
