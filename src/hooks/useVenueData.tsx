
import { useState, useEffect, useCallback } from 'react';
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
  
  // Set up realtime updates for venue hours and happy hours when a venue is selected
  useVenueHoursRealtimeUpdates(selectedVenue?.id || null);
  useVenueHappyHoursRealtimeUpdates(selectedVenue?.id || null);

  // Reset search subscriptions when selectedVenue changes
  useEffect(() => {
    console.log('useVenueData: Selected venue changed:', selectedVenue?.name || 'none');
    if (selectedVenue) {
      console.log('useVenueData: Selected venue coordinates:', {
        lat: selectedVenue.latitude,
        lng: selectedVenue.longitude
      });
    }
  }, [selectedVenue]);

  // Provide a wrapped setter for selectedVenue that does additional validation
  const setSelectedVenueWithValidation = useCallback((venue: Venue | null) => {
    console.log('useVenueData: setSelectedVenueWithValidation called with venue:', 
      venue?.name || 'null');
    
    // Validate venue object if provided
    if (venue !== null && (!venue.id || !venue.name)) {
      console.error('Invalid venue object provided to setSelectedVenue:', venue);
      return;
    }
    
    // Log the update
    console.log('useVenueData: Setting selectedVenue to:', venue?.name || 'null');
    
    // Update the state
    setSelectedVenue(venue);
    
    // Debug: Check if state was updated correctly
    setTimeout(() => {
      console.log('useVenueData: After setSelectedVenue, current state is:', 
        selectedVenue?.name || 'null');
    }, 0);
  }, []);

  return {
    venues,
    isLoading,
    error,
    refetch,
    selectedVenue,
    setSelectedVenue: setSelectedVenueWithValidation,
    searchTerm,
    searchType,
    updateSearch
  };
};
