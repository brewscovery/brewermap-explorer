
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Venue } from '@/types/venue';
import { useVenueSearch } from './useVenueSearch';
import { useVenueRealtimeUpdates } from './useVenueRealtimeUpdates';
import { useBreweryRealtimeUpdates } from './useBreweryRealtimeUpdates';
import { useVenueHoursRealtimeUpdates } from './useVenueHoursRealtimeUpdates';
import { useVenueHappyHoursRealtimeUpdates } from './useVenueHappyHoursRealtimeUpdates';

export const useVenueData = (initialSearchTerm = '', initialSearchType: 'name' | 'city' | 'country' = 'name') => {
  // Use state for the selected venue with a proper initial value
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  
  // Use a ref to track the current venue for logging purposes
  const selectedVenueRef = useRef<Venue | null>(null);
  
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
    // Update our ref when the state changes
    selectedVenueRef.current = selectedVenue;
    
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
    
    // Ensure we're working with a clean copy of the venue object to avoid reference issues
    const venueCopy = venue ? { ...venue } : null;
    
    // Update the state and ref immediately
    setSelectedVenue(venueCopy);
    selectedVenueRef.current = venueCopy;
    
    // Double check that the state was updated properly
    setTimeout(() => {
      console.log('useVenueData: After setSelectedVenue, immediately accessible ref value is:', 
        selectedVenueRef.current?.name || 'null');
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
