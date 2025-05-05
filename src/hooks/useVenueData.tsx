
import { useState, useEffect, useCallback } from 'react';
import type { Venue } from '@/types/venue';
import { useVenueSearch } from './useVenueSearch';
import { useVenueRealtimeUpdates } from './useVenueRealtimeUpdates';
import { useBreweryRealtimeUpdates } from './useBreweryRealtimeUpdates';
import { useVenueHoursRealtimeUpdates } from './useVenueHoursRealtimeUpdates';
import { useVenueHappyHoursRealtimeUpdates } from './useVenueHappyHoursRealtimeUpdates';

// Create a global state holder to ensure state is shared across components
// This is a simple solution to avoid prop drilling and ensure consistent state
let globalSelectedVenue: Venue | null = null;

export const useVenueData = (initialSearchTerm = '', initialSearchType: 'name' | 'city' | 'country' = 'name') => {
  // Use state for the selected venue with a proper initial value
  const [selectedVenue, setSelectedVenueState] = useState<Venue | null>(globalSelectedVenue);
  
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
  useVenueRealtimeUpdates(selectedVenue, (updatedVenue) => {
    if (updatedVenue) {
      setSelectedVenueWithValidation(updatedVenue);
    }
  });
  
  // Pass null for both parameters since we don't need to track brewery updates here
  useBreweryRealtimeUpdates(null, () => null);
  
  // Set up realtime updates for venue hours and happy hours when a venue is selected
  useVenueHoursRealtimeUpdates(selectedVenue?.id || null);
  useVenueHappyHoursRealtimeUpdates(selectedVenue?.id || null);

  // Log when selectedVenue changes
  useEffect(() => {
    console.log('useVenueData: Selected venue changed:', selectedVenue?.name || 'none');
    
    if (selectedVenue) {
      console.log('useVenueData: Selected venue coordinates:', {
        lat: selectedVenue.latitude,
        lng: selectedVenue.longitude
      });
    }
    
    // Update the global state when local state changes
    globalSelectedVenue = selectedVenue;
  }, [selectedVenue]);

  // Wrapper for setting selected venue that updates both local and global state
  const setSelectedVenue = useCallback((venue: Venue | null) => {
    console.log('useVenueData: setSelectedVenue called directly with venue:', 
      venue?.name || 'null');
    setSelectedVenueWithValidation(venue);
  }, []);

  // Provide a setter for selectedVenue that creates a clean copy of the venue object
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
    
    // Create a clean copy of the venue to avoid reference issues
    if (venue) {
      const venueCopy = {
        ...venue,
        id: venue.id,
        brewery_id: venue.brewery_id,
        name: venue.name,
        street: venue.street,
        city: venue.city,
        state: venue.state,
        postal_code: venue.postal_code,
        country: venue.country,
        longitude: venue.longitude,
        latitude: venue.latitude,
        phone: venue.phone,
        website_url: venue.website_url,
        created_at: venue.created_at,
        updated_at: venue.updated_at
      };
      
      // Update the state with the clean copy
      setSelectedVenueState(venueCopy);
      // Also update the global state
      globalSelectedVenue = venueCopy;
      console.log('useVenueData: Global state updated with venue:', venueCopy.name);
    } else {
      // Update the state with null
      setSelectedVenueState(null);
      // Also update the global state
      globalSelectedVenue = null;
      console.log('useVenueData: Global state updated with null venue');
    }
  }, []);

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
