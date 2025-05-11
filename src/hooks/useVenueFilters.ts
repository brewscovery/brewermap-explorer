
import { useState, useCallback, useMemo } from 'react';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';
import { VenueHour } from '@/types/venueHours';
import { VenueHappyHour } from '@/types/venueHappyHours';
import { VenueDailySpecial } from '@/types/venueDailySpecials';
import { getVenueOpenStatus, getKitchenOpenStatus, getTodayDayOfWeek } from '@/utils/dateTimeUtils';
import { useTodoLists } from '@/hooks/useTodoLists';
import { useAuth } from '@/contexts/AuthContext';

export interface VenueFiltersState {
  activeFilters: string[];
}

export function useVenueFilters(
  venues: Venue[],
  venueHours: Record<string, VenueHour[]>,
  venueHappyHours: Record<string, VenueHappyHour[]>,
  venueDailySpecials: Record<string, VenueDailySpecial[]>,
  venueEvents: Record<string, any[]>,
  breweries: Record<string, Brewery> = {}
) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [lastFilterUpdateTime, setLastFilterUpdateTime] = useState<number>(0);
  const { user } = useAuth();
  const { todoListVenues } = useTodoLists();
  
  const handleFilterChange = useCallback((filters: string[]) => {
    console.log('Filter changed to:', filters);
    setActiveFilters(filters);
    setLastFilterUpdateTime(Date.now());
  }, []);
  
  // Use useMemo with dependencies that should trigger recalculation
  const filteredVenues = useMemo(() => {
    // Only log when filters actually change (not on every render)
    if (activeFilters.length > 0) {
      console.log(`Filtering ${venues.length} venues with ${activeFilters.length} active filters`);
    }
    
    if (activeFilters.length === 0) {
      return venues;
    }
    
    return venues.filter(venue => {
      // Skip venues without valid coordinates
      if (!venue.latitude || !venue.longitude) {
        return false;
      }
      
      const venueId = venue.id;
      const breweryId = venue.brewery_id;
      const brewery = breweries[breweryId];
      const hours = venueHours[venueId] || [];
      const happyHours = venueHappyHours[venueId] || [];
      const dailySpecials = venueDailySpecials[venueId] || [];
      const events = venueEvents[venueId] || [];
      
      // Group filters into types
      const standardFilters = activeFilters.filter(f => !f.startsWith('todo-list-'));
      const todoListFilters = activeFilters.filter(f => f.startsWith('todo-list-'));
      
      // If we have todo list filters, check if this venue is in any of the selected todo lists
      // and is not completed
      if (todoListFilters.length > 0) {
        // Return false if user is not logged in (shouldn't happen in UI, but just in case)
        if (!user) return false;
        
        const matchesTodoListFilter = todoListFilters.some(filter => {
          const listId = filter.replace('todo-list-', '');
          // Check if this venue is in this todo list and not completed
          return todoListVenues.some(item => 
            item.todo_list_id === listId && 
            item.venue_id === venueId && 
            !item.is_completed
          );
        });
        
        // If no matches with todo list filters, exclude this venue
        if (!matchesTodoListFilter) return false;
      }
      
      // If no standard filters remain, we're done
      if (standardFilters.length === 0) {
        return true;
      }
      
      // Check each standard filter
      return standardFilters.every(filter => {
        switch (filter) {
          case 'open-now': {
            const openStatus = getVenueOpenStatus(hours);
            return openStatus.isOpen;
          }
          
          case 'kitchen-open': {
            const kitchenStatus = getKitchenOpenStatus(hours);
            return kitchenStatus.isOpen;
          }
          
          case 'happy-hour': {
            // Check if there's a happy hour today
            const todayIndex = getTodayDayOfWeek();
            const todayHappyHours = happyHours.filter(h => 
              h.day_of_week === todayIndex && h.is_active
            );
            
            if (todayHappyHours.length === 0) return false;
            
            // Check if any happy hour is currently active
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
            
            return todayHappyHours.some(h => {
              // All day happy hour
              if (!h.start_time || !h.end_time) return true;
              
              // Check if current time is before happy hour ends
              const start = h.start_time.substring(0, 5);
              const end = h.end_time.substring(0, 5);
              return currentTimeStr <= end;
            });
          }
          
          case 'daily-special': {
            // Check if there's a daily special today
            const todayIndex = getTodayDayOfWeek();
            const todaySpecials = dailySpecials.filter(s => 
              s.day_of_week === todayIndex && s.is_active
            );
            
            if (todaySpecials.length === 0) return false;
            
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
            
            return todaySpecials.some(s => {
              // All day special
              if (!s.start_time || !s.end_time) return true;
              
              // Check if current time is before daily special ends
              const start = s.start_time.substring(0, 5);
              const end = s.end_time.substring(0, 5);
              return currentTimeStr < end;
            });
          }
          
          case 'events': {
            const now = new Date();
            const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            return events.some(event => {
              // All day event
              if (!event.start_time || !event.end_time) return true;

              // Check if current time is before event ends
              const endTime = event.end_time.substring(0,5);
              return currentTimeStr < endTime;
            });
          }
          
          case 'verified-breweries': {
            // Check if this venue belongs to a verified brewery
            return brewery && brewery.is_verified === true;
          }
          
          case 'independent-breweries': {
            // Check if this venue belongs to an independent brewery
            return brewery && brewery.is_independent === true;
          }
          
          default:
            return true;
        }
      });
    });
  }, [venues, activeFilters, venueHours, venueHappyHours, venueDailySpecials, venueEvents, todoListVenues, user, breweries]);
  
  return {
    activeFilters,
    setActiveFilters,
    handleFilterChange,
    filteredVenues,
    lastFilterUpdateTime
  };
}
