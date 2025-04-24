
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Venue } from './types';

interface EventsFiltersProps {
  venues: Venue[];
  selectedVenue: string;
  onVenueChange: (value: string) => void;
  publishedFilter: boolean | null;
  onPublishedChange: (value: boolean | null) => void;
  dateFilter: 'upcoming' | 'past' | 'all';
  onDateFilterChange: (value: 'upcoming' | 'past' | 'all') => void;
}

export const EventsFilters: React.FC<EventsFiltersProps> = ({
  venues,
  selectedVenue,
  onVenueChange,
  publishedFilter,
  onPublishedChange,
  dateFilter,
  onDateFilterChange,
}) => {
  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="w-[200px]">
          <Label htmlFor="venue-filter">Venue</Label>
          <Select
            value={selectedVenue}
            onValueChange={onVenueChange}
          >
            <SelectTrigger id="venue-filter">
              <SelectValue placeholder="All venues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All venues</SelectItem>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Label htmlFor="published-filter">Published Only</Label>
          <Switch
            id="published-filter"
            checked={publishedFilter === true}
            onCheckedChange={(checked) => onPublishedChange(checked ? true : null)}
          />
        </div>

        <div>
          <Label>Date Range</Label>
          <RadioGroup
            value={dateFilter}
            onValueChange={(value: 'upcoming' | 'past' | 'all') => onDateFilterChange(value)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upcoming" id="upcoming" />
              <Label htmlFor="upcoming">Upcoming Events</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="past" id="past" />
              <Label htmlFor="past">Past Events</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All Events</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};
