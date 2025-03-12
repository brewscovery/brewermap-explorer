
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';
import { toast } from 'sonner';

export const useVenueData = (initialSearchTerm = '', initialSearchType: 'name' | 'city' | 'country' = 'name') => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchType, setSearchType] = useState<'name' | 'city' | 'country'>(initialSearchType);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const queryClient = useQueryClient();

  const { data: venues = [], isLoading, error, refetch } = useQuery({
    queryKey: ['venues', searchTerm, searchType],
    queryFn: async () => {
      if (!searchTerm) {
        const { data, error } = await supabase
          .from('venues')
          .select('*');

        if (error) throw error;
        return data || [];
      }

      if (searchType === 'city') {
        const { data, error } = await supabase.functions.invoke('geocode-city', {
          body: { city: searchTerm }
        });

        if (error) throw error;
        return data || [];
      }

      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .filter(
          searchType === 'name' 
            ? 'name' 
            : 'country',
          'ilike',
          `%${searchTerm}%`
        );

      if (error) throw error;
      return data || [];
    }
  });

  // Subscribe to realtime changes on venues table
  useEffect(() => {
    console.log('Setting up realtime subscription for venues');
    
    // Create a channel for all venue-related changes
    const channel = supabase
      .channel('venues-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'venues'
        },
        (payload) => {
          console.log('Venue change detected:', payload);
          
          // Handle the specific type of change
          if (payload.eventType === 'INSERT') {
            console.log('New venue added:', payload.new);
            // Invalidate all venue queries to ensure all views update
            queryClient.invalidateQueries({ queryKey: ['venues'] });
            
            // Also invalidate any specific brewery venue queries
            if (payload.new && typeof payload.new === 'object' && 'brewery_id' in payload.new) {
              queryClient.invalidateQueries({ 
                queryKey: ['breweryVenues', payload.new.brewery_id] 
              });
            }
          } 
          else if (payload.eventType === 'UPDATE') {
            console.log('Venue updated:', payload.new);
            
            // Invalidate general venue queries
            queryClient.invalidateQueries({ queryKey: ['venues'] });
            
            // If this is the currently selected venue, update it
            if (selectedVenue && payload.new && typeof payload.new === 'object' && 'id' in payload.new && 
                selectedVenue.id === payload.new.id) {
              setSelectedVenue(payload.new as Venue);
            }
            
            // Also invalidate specific brewery venue queries
            if (payload.new && typeof payload.new === 'object' && 'brewery_id' in payload.new) {
              queryClient.invalidateQueries({ 
                queryKey: ['breweryVenues', payload.new.brewery_id] 
              });
            }
          }
          else if (payload.eventType === 'DELETE') {
            console.log('Venue deleted:', payload.old);
            
            // Invalidate all venue queries
            queryClient.invalidateQueries({ queryKey: ['venues'] });
            
            // If this is the currently selected venue, deselect it
            if (selectedVenue && payload.old && typeof payload.old === 'object' && 'id' in payload.old && 
                selectedVenue.id === payload.old.id) {
              setSelectedVenue(null);
            }
            
            // Also invalidate specific brewery venue queries
            if (payload.old && typeof payload.old === 'object' && 'brewery_id' in payload.old) {
              queryClient.invalidateQueries({ 
                queryKey: ['breweryVenues', payload.old.brewery_id] 
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription for venues');
      supabase.removeChannel(channel);
    };
  }, [queryClient, selectedVenue]);

  // Setup listener for brewery information changes
  useEffect(() => {
    console.log('Setting up realtime subscription for breweries');
    
    const breweryChannel = supabase
      .channel('breweries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'breweries'
        },
        (payload) => {
          console.log('Brewery change detected:', payload);
          
          // Invalidate any queries that might contain brewery data
          queryClient.invalidateQueries({ queryKey: ['breweries'] });
          
          // If a specific brewery was changed, invalidate its data
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            queryClient.invalidateQueries({ 
              queryKey: ['brewery', payload.new.id]
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription for breweries');
      supabase.removeChannel(breweryChannel);
    };
  }, [queryClient]);

  // Setup listener for venue hours changes
  useEffect(() => {
    console.log('Setting up realtime subscription for venue hours');
    
    const hoursChannel = supabase
      .channel('venue-hours-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'venue_hours'
        },
        (payload) => {
          console.log('Venue hours change detected:', payload);
          
          // If venue hours change, invalidate the specific venue hours query
          const venueId = 
            (payload.new && typeof payload.new === 'object' && 'venue_id' in payload.new) ? payload.new.venue_id :
            (payload.old && typeof payload.old === 'object' && 'venue_id' in payload.old) ? payload.old.venue_id :
            null;
            
          if (venueId) {
            queryClient.invalidateQueries({ 
              queryKey: ['venueHours', venueId]
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription for venue hours');
      supabase.removeChannel(hoursChannel);
    };
  }, [queryClient]);

  const updateSearch = (newTerm: string, newType: 'name' | 'city' | 'country') => {
    setSearchTerm(newTerm);
    setSearchType(newType);
  };

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
