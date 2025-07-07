import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const MapSkeleton = () => {
  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Search bar skeleton */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      
      {/* Map skeleton */}
      <div className="flex-1 relative bg-muted">
        <Skeleton className="absolute inset-0" />
        
        {/* Mock venue points */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-8 opacity-20">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 bg-primary rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Loading text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-foreground font-medium">Loading venues...</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation controls placeholder */}
      <div className="absolute bottom-4 right-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
        </div>
      </div>
    </div>
  );
};