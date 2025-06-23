
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const AnalyticsEmptyState = () => {
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
};
