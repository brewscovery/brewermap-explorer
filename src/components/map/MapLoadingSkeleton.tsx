
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface MapLoadingSkeletonProps {
  progress?: number;
  venueCount?: number;
  totalCount?: number;
}

const MapLoadingSkeleton = ({ progress = 0, venueCount = 0, totalCount }: MapLoadingSkeletonProps) => {
  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-sm mx-auto p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        
        <div className="space-y-3">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            {venueCount > 0 && totalCount ? (
              <>Loading venues... {venueCount} of {totalCount}</>
            ) : (
              <>Initializing map...</>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-6">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
};

export default MapLoadingSkeleton;
