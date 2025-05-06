
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Venue } from '@/types/venue';
import { useVenueSearch } from './useVenueSearch';
import { useVenueRealtimeUpdates } from './useVenueRealtimeUpdates';
import { useBreweryRealtimeUpdates } from './useBreweryRealtimeUpdates';
import { useVenueHoursRealtimeUpdates } from './useVenueHoursRealtimeUpdates';
import { useVenueHappyHoursRealtimeUpdates } from './useVenueHappyHoursRealtimeUpdates';
import { useWindowFocus } from './useWindowFocus';

// Global state holder that persists between component remounts and window focus events
// Using sessionStorage for persistence across focus events
const getGlobalVenueState = (): Venue | null => {
  try {
    const savedVenue = sessionStorage.getItem('selectedVenue');
    return savedVenue ? JSON.parse(savedVenue) : null;
  } catch (e) {
    console.error('Error parsing saved venue:', e);
    return null;
  }
};

const saveGlobalVenueState = (venue: Venue | null): void => {
  try {
    if (venue) {
      sessionStorage.setItem('selectedVenue', JSON.stringify(venue));
      console.log('useVenueData: Saved venue to sessionStorage:', venue.name);
    } else {
      sessionStorage.removeItem('selectedVenue');
      console.log('useVenueData: Removed venue from sessionStorage');
    }
  } catch (e) {
    console.error('Error saving venue:', e);
  }
};

export const useVenueData = (initialSearchTerm = '', initialSearchType: 'name' | 'city' | 'country' = 'name') => {
  // Always initialize state from sessionStorage to ensure consistency
  const [selectedVenue, setSelectedVenueState] = useState<Venue | null>(() => {
    const savedVenue = getGlobalVenueState();
    console.log('useVenueData: Initializing with saved state:', savedVenue?.name || 'null');
    return savedVenue;
  });
  
  // Create a ref to track whether the selectedVenue has changed since mount
  const hasSelectedVenueChanged = useRef(false);
  const isWindowFocused = useWindowFocus();
  
  // Log that the hook has been initialized with the current global state
  console.log('useVenueData: Hook initialized with selectedVenue:', selectedVenue?.name || 'null');
  
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

  // Set up realtime updates - this runs on mount and when selectedVenue changes
  useVenueRealtimeUpdates(selectedVenue, (updatedVenue) => {
    if (updatedVenue) {
      console.log('useVenueData: Received venue update from realtime:', updatedVenue.name);
      setSelectedVenueWithValidation(updatedVenue);
    }
  });
  
  // Pass null for both parameters since we don't need to track brewery updates here
  useBreweryRealtimeUpdates(null, () => null);
  
  // Set up realtime updates for venue hours and happy hours when a venue is selected
  useVenueHoursRealtimeUpdates(selectedVenue?.id || null);
  useVenueHappyHoursRealtimeUpdates(selectedVenue?.id || null);

  // Handle window focus events to ensure state consistency
  useEffect(() => {
    if (isWindowFocused) {
      console.log('useVenueData: Window focused, checking for saved venue state');
      const savedVenue = getGlobalVenueState();
      
      // Only update if there's a saved venue and our current state doesn't match
      if (savedVenue && (!selectedVenue || savedVenue.id !== selectedVenue.id)) {
        console.log('useVenueData: Restoring venue from saved state:', savedVenue.name);
        setSelectedVenueState(savedVenue);
        hasSelectedVenueChanged.current = true;
      }
    }
  }, [isWindowFocused, selectedVenue]);

  // Log whenever selectedVenue changes and update global state
  useEffect(() => {
    if (selectedVenue) {
      console.log('useVenueData: Selected venue changed:', selectedVenue.name);
      console.log('useVenueData: Selected venue coordinates:', {
        lat: selectedVenue.latitude,
        lng: selectedVenue.longitude
      });
      
      // Update the sessionStorage when local state changes
      saveGlobalVenueState(selectedVenue);
      hasSelectedVenueChanged.current = true;
    } else {
      console.log('useVenueData: Selected venue changed: none');
      saveGlobalVenueState(null);
    }
  }, [selectedVenue]);

  // Wrapper for setting selected venue that updates both local and global state
  const setSelectedVenue = useCallback((venue: Venue | null) => {
    console.log('useVenueData: setSelectedVenue called directly with venue:', 
      venue?.name || 'null');
    setSelectedVenueWithValidation(venue);
  }, []);

  // Ensure venue objects are properly copied and validated
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
    
    // Create a DEEP copy of the venue to avoid reference issues
    if (venue) {
      // Use JSON parse/stringify for a true deep copy
      const venueCopy = JSON.parse(JSON.stringify(venue));
      
      // Ensure latitude and longitude are present and in the right format
      if (venueCopy.latitude && venueCopy.longitude) {
        venueCopy.latitude = String(venueCopy.latitude);
        venueCopy.longitude = String(venueCopy.longitude);
      }
      
      // Update both component state and sessionStorage
      setSelectedVenueState(venueCopy);
      saveGlobalVenueState(venueCopy);
    } else {
      // Update the state with null
      setSelectedVenueState(null);
      saveGlobalVenueState(null);
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
    updateSearch,
    hasSelectedVenueChanged: hasSelectedVenueChanged.current
  };
};
