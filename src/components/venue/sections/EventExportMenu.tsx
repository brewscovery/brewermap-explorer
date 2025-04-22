
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

interface EventExportMenuProps {
  event: VenueEvent;
}

const EventExportMenu = ({ event }: EventExportMenuProps) => {
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
        <DropdownMenuItem onClick={() => window.open(generateGoogleCalendarUrl(event), '_blank')}>
          <CalendarIcon className="mr-2" size={16} />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generateICalFile(event)}>
          <Download className="mr-2" size={16} />
          Download iCal
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EventExportMenu;
