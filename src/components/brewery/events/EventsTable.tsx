
import React, { useState } from "react";
import { useVenueEvents, useDeleteVenueEvent, VenueEvent } from "@/hooks/useVenueEvents";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import EditEventDialog from "./EditEventDialog";
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Venue {
  id: string;
  name: string;
}

interface EventsTableProps {
  venueIds: string[];
  venues: Venue[];
}

const EventsTable: React.FC<EventsTableProps> = ({ venueIds, venues }) => {
  // aggregate all events from all venues
  const allEvents: VenueEvent[] = [];
  let isLoading = false;

  // We fetch events per venue
  venueIds.forEach((venueId) => {
    const { data, isLoading: venueLoading } = useVenueEvents(venueId);
    if (venueLoading) isLoading = true;
    if (data) allEvents.push(...data);
  });

  const venueMap = Object.fromEntries(venues.map(v => [v.id, v.name]));

  // Edit dialog state
  const [editEvent, setEditEvent] = useState<VenueEvent | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Delete dialog state
  const [deleteEvent, setDeleteEvent] = useState<VenueEvent | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteMutation = useDeleteVenueEvent();

  const handleDelete = async () => {
    if (!deleteEvent) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteEvent.id, venue_id: deleteEvent.venue_id });
      toast.success("Event deleted!");
    } catch {
      toast.error("Failed to delete event.");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  if (venueIds.length === 0) {
    return <div>No venues found. Please create a venue to add events.</div>;
  }

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  // Sort by start_time DESC (future first)
  allEvents.sort((a, b) => b.start_time.localeCompare(a.start_time));

  return (
    <div className="bg-white shadow rounded p-4">
      <table className="min-w-full text-sm border-separate border-spacing-y-1">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="py-1">Title</th>
            <th className="py-1">Venue</th>
            <th className="py-1">Start</th>
            <th className="py-1">End</th>
            <th className="py-1">Published</th>
            <th className="py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {allEvents.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 text-center text-muted-foreground">
                No events found.
              </td>
            </tr>
          ) : (
            allEvents.map((event) => (
              <tr key={event.id} className="hover:bg-muted/30">
                <td className="py-1">{event.title}</td>
                <td className="py-1">{venueMap[event.venue_id] || event.venue_id}</td>
                <td className="py-1">{format(new Date(event.start_time), "PPPp")}</td>
                <td className="py-1">{format(new Date(event.end_time), "PPPp")}</td>
                <td className="py-1">{event.is_published ? "Yes" : "No"}</td>
                <td className="py-1 flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditEvent(event); setShowEditDialog(true); }}
                    aria-label="Edit"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setDeleteEvent(event); setShowDeleteDialog(true); }}
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <EditEventDialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) setEditEvent(null);
        }}
        event={editEvent}
      />
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the event "{deleteEvent?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowDeleteDialog(false)}
            >Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventsTable;
