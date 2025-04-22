
import React from 'react';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { generateGoogleCalendarUrl, generateICalFile } from '@/utils/calendarUtils';
import type { VenueEvent } from '@/hooks/useVenueEvents';
import type { Venue } from '@/types/venue';

interface EventExportMenuProps {
  event: VenueEvent;
  venue: Venue;
}

const EventExportMenu = ({ event, venue }: EventExportMenuProps) => {
  const eventWithVenue = {
    ...event,
    venue: {
      name: venue.name,
      street: venue.street,
      city: venue.city,
      state: venue.state,
      postal_code: venue.postal_code,
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
        >
          <CalendarIcon className="mr-2" size={16} />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => window.open(generateGoogleCalendarUrl(eventWithVenue), '_blank')}>
          <CalendarIcon className="mr-2" size={16} />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generateICalFile(eventWithVenue)}>
          <Download className="mr-2" size={16} />
          Download iCal
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EventExportMenu;
