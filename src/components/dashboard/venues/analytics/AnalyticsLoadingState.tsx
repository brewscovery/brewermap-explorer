
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const AnalyticsLoadingState = () => {
  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-lg font-semibold">Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
};
