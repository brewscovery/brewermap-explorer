import React, { lazy, Suspense } from 'react';
import { MapSkeleton } from '@/components/loading/MapSkeleton';
import type { Venue } from '@/types/venue';

// Direct import for debugging
import Map from '@/components/Map';

interface LazyMapProps {
  venues: Venue[];
  onVenueSelect: (venue: Venue | null) => void;
  selectedVenue?: Venue | null;
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  lastFilterUpdateTime?: number;
}

export const LazyMap = (props: LazyMapProps) => {
  console.log('LazyMap rendering with venues:', props.venues.length);
  
  return (
    <Map {...props} />
  );
};