
import React from 'react';
import { Clock, Utensils, Beer, MenuSquare, Calendar, ListTodo, Shield, Leaf } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Separator } from '@/components/ui/separator';
import { useAuth } from "@/contexts/AuthContext";
import { useTodoLists } from "@/hooks/useTodoLists";

export interface VenueFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  tooltip: string;
}

export const VENUE_FILTERS: VenueFilter[] = [
  {
    id: 'open-now',
    label: 'Open',
    icon: <Clock size={18} />,
    tooltip: 'Currently Open Venues'
  },
  {
    id: 'kitchen-open',
    label: 'Food',
    icon: <Utensils size={18} />,
    tooltip: 'Kitchen Open Now'
  },
  {
    id: 'happy-hour',
    label: 'Happy Hr',
    icon: <Beer size={18} />,
    tooltip: 'Happy Hours Today'
  },
  {
    id: 'daily-special',
    label: 'Specials',
    icon: <MenuSquare size={18} />,
    tooltip: 'Daily Specials Today'
  },
  {
    id: 'events',
    label: 'Events',
    icon: <Calendar size={18} />,
    tooltip: 'Events Today'
  },
  {
    id: 'verified-breweries',
    label: 'Verified',
    icon: <Shield size={18} />,
    tooltip: 'Venues from Verified Breweries'
  },
  {
    id: 'independent-breweries',
    label: 'Indie',
    icon: <Leaf size={18} />,
    tooltip: 'Venues from Independent Breweries'
  }
];

interface MapFiltersProps {
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
  className?: string;
}

const MapFilters = ({ activeFilters, onFilterChange, className }: MapFiltersProps) => {
  const { user } = useAuth();
  const { todoLists, todoListVenues } = useTodoLists();
  
  // Filter todo lists to get only those with incomplete items
  const todoListsWithIncomplete = todoLists.filter(list => {
    const venuesInList = todoListVenues.filter(item => 
      item.todo_list_id === list.id && !item.is_completed
    );
    return venuesInList.length > 0;
  });
  
  // Create filter IDs for todo lists
  const getTodoListFilterId = (listId: string) => `todo-list-${listId}`;
  
  // Handle individual filter toggle
  const toggleFilter = (filterId: string) => {
    if (activeFilters.includes(filterId)) {
      // Remove filter if already active
      onFilterChange(activeFilters.filter(id => id !== filterId));
    } else {
      // Add filter if not active
      onFilterChange([...activeFilters, filterId]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    onFilterChange([]);
  };

  // Check if we have any todo list filters active
  const hasTodoListFilters = activeFilters.some(filter => filter.startsWith('todo-list-'));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        <div className="bg-white border rounded-lg shadow-md p-1 flex flex-wrap gap-1">
          {VENUE_FILTERS.map((filter) => (
            <Tooltip key={filter.id} delayDuration={300}>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={activeFilters.includes(filter.id)}
                  onPressedChange={() => toggleFilter(filter.id)}
                  variant="outline" 
                  size="sm"
                  className={`flex items-center gap-1 text-xs whitespace-nowrap transition-all duration-200
                    ${activeFilters.includes(filter.id) 
                      ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm" 
                      : "bg-background text-muted-foreground hover:bg-accent/50"
                    }`}
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                <p>{filter.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {user && todoListsWithIncomplete.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-6 mx-1" />
              
              {todoListsWithIncomplete.map(list => {
                const filterId = getTodoListFilterId(list.id);
                const incompleteCount = todoListVenues.filter(
                  item => item.todo_list_id === list.id && !item.is_completed
                ).length;
                
                return (
                  <Tooltip key={filterId} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Toggle
                        pressed={activeFilters.includes(filterId)}
                        onPressedChange={() => toggleFilter(filterId)}
                        variant="outline" 
                        size="sm"
                        className={`flex items-center gap-1 text-xs whitespace-nowrap transition-all duration-200
                          ${activeFilters.includes(filterId) 
                            ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm" 
                            : "bg-background text-muted-foreground hover:bg-accent/50"
                          }`}
                      >
                        <ListTodo size={18} />
                        <span>{list.name} ({incompleteCount})</span>
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="center">
                      <p>Venues in "{list.name}" to visit</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </>
          )}
          
          {activeFilters.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters} 
              className="text-xs font-normal hover:bg-destructive/10 hover:text-destructive"
            >
              Clear
            </Button>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default MapFilters;
