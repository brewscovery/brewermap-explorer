
import React from 'react';
import { Clock, Utensils, Beer, MenuSquare, Calendar } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  }
];

interface MapFiltersProps {
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
  className?: string;
}

const MapFilters = ({ activeFilters, onFilterChange, className }: MapFiltersProps) => {
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

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        <div className="bg-white border rounded-lg shadow-md p-2 flex flex-wrap gap-2">
          {VENUE_FILTERS.map((filter) => (
            <Tooltip key={filter.id} delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-2 py-1">
                  <Switch 
                    id={`filter-${filter.id}`}
                    checked={activeFilters.includes(filter.id)}
                    onCheckedChange={() => toggleFilter(filter.id)}
                  />
                  <Label 
                    htmlFor={`filter-${filter.id}`}
                    className="flex items-center gap-1.5 cursor-pointer text-xs whitespace-nowrap"
                  >
                    {filter.icon}
                    <span>{filter.label}</span>
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                <p>{filter.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default MapFilters;
