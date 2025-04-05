
import { useState } from 'react';
import type { Venue } from '@/types/venue';
import { useVenueSearch } from './useVenueSearch';
import { useVenueRealtimeUpdates } from './useVenueRealtimeUpdates';
import { useBreweryRealtimeUpdates } from './useBreweryRealtimeUpdates';
import { useVenueHoursRealtimeUpdates } from './useVenueHoursRealtimeUpdates';
import { useVenueHappyHoursRealtimeUpdates } from './useVenueHappyHoursRealtimeUpdates';

export const useVenueData = (initialSearchTerm = '', initialSearchType: 'name' | 'city' | 'country' = 'name') => {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  
  // Get venue search functionality
  const { 
    venues, 
    isLoading, 
    error, 
    refetch, 
    searchTerm,
    searchType,
    updateSearch
  } = useVenueSearch(initialSearchTerm, initialSearchType);

  // Set up realtime updates
  useVenueRealtimeUpdates(selectedVenue, setSelectedVenue);
  
  // Pass null for both parameters since we don't need to track brewery updates here
  useBreweryRealtimeUpdates(null, () => null);
  
  useVenueHoursRealtimeUpdates(selectedVenue?.id || null);
  useVenueHappyHoursRealtimeUpdates(selectedVenue?.id || null);

  return {
    venues,
    isLoading,
    error,
    refetch,
    selectedVenue,
    setSelectedVenue,
    searchTerm,
    searchType,
    updateSearch
  };
};
