
import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarDays, List } from "lucide-react";
import EventsTable from "./EventsTable";
import EventsCalendarView from "./EventsCalendarView";
import { VenueEvent } from "@/hooks/useVenueEvents";
import CreateEventDialog from "./CreateEventDialog";

interface Venue {
  id: string;
  name: string;
}

interface EventsViewToggleProps {
  events: VenueEvent[];
  venues: Venue[];
  venueIds: string[];
}

type ViewMode = "calendar" | "table";

const EventsViewToggle: React.FC<EventsViewToggleProps> = ({ events, venues, venueIds }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [editEvent, setEditEvent] = useState<VenueEvent | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<VenueEvent | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleCreateEvent = (date: Date) => {
    setSelectedDate(date);
    setShowCreateDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
          <ToggleGroupItem value="calendar" aria-label="Calendar view">
            <CalendarDays className="h-4 w-4" />
            <span className="ml-2">Calendar</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <List className="h-4 w-4" />
            <span className="ml-2">Table</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === "calendar" ? (
        <EventsCalendarView 
          events={events}
          venues={venues}
          onEditEvent={setEditEvent}
          onDeleteEvent={setDeleteEvent}
          onCreateEvent={handleCreateEvent}
        />
      ) : (
        <EventsTable 
          venueIds={venueIds} 
          venues={venues} 
        />
      )}

      {venues && venues.length > 0 && (
        <CreateEventDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          venues={venues}
          defaultVenueId={venues[0]?.id || ""}
          initialDate={selectedDate}
        />
      )}
    </div>
  );
};

export default EventsViewToggle;
