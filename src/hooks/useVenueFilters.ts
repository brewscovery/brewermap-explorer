
import { useState, useCallback, useMemo } from 'react';
import type { Venue } from '@/types/venue';
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
  venueEvents: Record<string, any[]>
) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { user } = useAuth();
  const { todoListVenues } = useTodoLists();
  
  const handleFilterChange = useCallback((filters: string[]) => {
    console.log('Filter changed to:', filters);
    setActiveFilters(filters);
  }, []);
  
  const filteredVenues = useMemo(() => {
    console.log(`Filtering ${venues.length} venues with ${activeFilters.length} active filters`);
    
    if (activeFilters.length === 0) {
      return venues;
    }
    
    return venues.filter(venue => {
      // Skip venues without valid coordinates
      if (!venue.latitude || !venue.longitude) {
        return false;
      }
      
      const venueId = venue.id;
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
              
              // Check if current time is within the happy hour
              const start = h.start_time.substring(0, 5);
              const end = h.end_time.substring(0, 5);
              return currentTimeStr >= start && currentTimeStr <= end;
            });
          }
          
          case 'daily-special': {
            // Check if there's a daily special today
            const todayIndex = getTodayDayOfWeek();
            const todaySpecials = dailySpecials.filter(s => 
              s.day_of_week === todayIndex && s.is_active
            );
            
            if (todaySpecials.length === 0) return false;
            
            // Check if any special is currently active
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
            
            return todaySpecials.some(s => {
              // All day special
              if (!s.start_time || !s.end_time) return true;
              
              // Check if current time is within the special time
              const start = s.start_time.substring(0, 5);
              const end = s.end_time.substring(0, 5);
              return currentTimeStr >= start && currentTimeStr <= end;
            });
          }
          
          case 'events': {
            // Check if there are events today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            return events.some(event => {
              const eventDate = new Date(event.start_time);
              return eventDate >= today && eventDate < tomorrow;
            });
          }
          
          default:
            return true;
        }
      });
    });
  }, [venues, activeFilters, venueHours, venueHappyHours, venueDailySpecials, venueEvents, todoListVenues, user]);
  
  return {
    activeFilters,
    setActiveFilters,
    handleFilterChange,
    filteredVenues
  };
}
