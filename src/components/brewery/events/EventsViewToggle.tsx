
import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarDays, List } from "lucide-react";
import EventsTable from "./EventsTable";
import EventsCalendarView from "./EventsCalendarView";
import { VenueEvent, useDeleteVenueEvent } from "@/hooks/useVenueEvents";
import CreateEventDialog from "./CreateEventDialog";
import EditEventDialog from "./EditEventDialog";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

  const deleteEventMutation = useDeleteVenueEvent();

  const handleCreateEvent = (date: Date) => {
    setSelectedDate(date);
    setShowCreateDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteEvent) return;
    
    try {
      await deleteEventMutation.mutateAsync({
        id: deleteEvent.id,
        venue_id: deleteEvent.venue_id
      });
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    } finally {
      setDeleteEvent(null);
    }
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
        <>
          <CreateEventDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            venues={venues}
            defaultVenueId={venues[0]?.id || ""}
            initialDate={selectedDate}
          />
          
          <EditEventDialog
            open={!!editEvent}
            onOpenChange={(open) => !open && setEditEvent(null)}
            event={editEvent}
            venues={venues}
          />
          
          <AlertDialog open={!!deleteEvent} onOpenChange={(open) => !open && setDeleteEvent(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this event? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};

export default EventsViewToggle;
