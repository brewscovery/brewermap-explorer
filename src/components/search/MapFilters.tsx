
import React, { useState } from 'react';
import { Clock, Utensils, Beer, MenuSquare, Calendar } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { getTodayDayOfWeek } from '@/utils/dateTimeUtils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        <ToggleGroup
          type="multiple"
          value={activeFilters}
          onValueChange={onFilterChange}
          className="bg-white border rounded-lg shadow-md p-1 flex flex-wrap gap-1"
        >
          {VENUE_FILTERS.map((filter) => (
            <Tooltip key={filter.id} delayDuration={300}>
              <TooltipTrigger asChild>
                <ToggleGroupItem 
                  value={filter.id}
                  aria-label={filter.tooltip}
                  variant="outline"
                  className="flex items-center gap-1.5 px-2 py-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-xs whitespace-nowrap"
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                <p>{filter.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
      </TooltipProvider>
    </div>
  );
};

export default MapFilters;
