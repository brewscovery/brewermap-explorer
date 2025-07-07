import React, { lazy, Suspense } from 'react';
import { MapSkeleton } from '@/components/loading/MapSkeleton';
import type { Venue } from '@/types/venue';

// Lazy load the heavy Map component
const Map = lazy(() => import('@/components/Map'));

interface LazyMapProps {
  venues: Venue[];
  onVenueSelect: (venue: Venue | null) => void;
  selectedVenue?: Venue | null;
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  lastFilterUpdateTime?: number;
}

export const LazyMap = (props: LazyMapProps) => {
  return (
    <Suspense fallback={<MapSkeleton />}>
      <Map {...props} />
    </Suspense>
  );
};