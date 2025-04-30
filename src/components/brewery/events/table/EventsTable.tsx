
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useVenueEvents, useDeleteVenueEvent } from "@/hooks/useVenueEvents";
import { supabase } from '@/integrations/supabase/client';
import EditEventDialog from "../EditEventDialog";
import { toast } from "sonner";
import { EventRow } from "./EventRow";
import { DeleteEventDialog } from "./DeleteEventDialog";
import { EventsFilters } from "./EventsFilters";
import { TableHeader } from "./TableHeader";
import { useEventsTable } from "./useEventsTable";
import { EmptyEventsState } from "./EmptyEventsState";
import { EventsTableBody } from "./EventsTableBody";
import { EventsTableHeader } from "./EventsTableHeader";
import { useEventsFetching } from "./useEventsFetching";
import type { EventsTableProps } from "./types";
import type { VenueEvent } from "@/hooks/useVenueEvents";

const EventsTable: React.FC<EventsTableProps> = ({ venueIds, venues }) => {
  const [editEvent, setEditEvent] = useState<VenueEvent | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteEvent, setDeleteEvent] = useState<VenueEvent | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteMutation = useDeleteVenueEvent();

  const { allEvents, isLoading, setAllEvents } = useEventsFetching(venueIds);
  const venueMap = Object.fromEntries(venues.map(v => [v.id, v.name]));

  const {
    sortedAndFilteredEvents,
    sortField,
    sortDirection,
    toggleSort,
    selectedVenue,
    setSelectedVenue,
    publishedFilter,
    setPublishedFilter,
    dateFilter,
    setDateFilter,
  } = useEventsTable({ events: allEvents, venues });

  const handleDelete = async () => {
    if (!deleteEvent) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteEvent.id, venue_id: deleteEvent.venue_id });
      toast.success("Event deleted!");
      
      setAllEvents(prev => prev.filter(event => event.id !== deleteEvent.id));
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

  return (
    <div className="w-full bg-white shadow rounded p-4">
      <EventsFilters
        venues={venues}
        selectedVenue={selectedVenue}
        onVenueChange={setSelectedVenue}
        publishedFilter={publishedFilter}
        onPublishedChange={setPublishedFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-1">
          <EventsTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            toggleSort={toggleSort}
          />
          <EventsTableBody
            events={sortedAndFilteredEvents}
            venueMap={venueMap}
            onEdit={(event) => { setEditEvent(event); setShowEditDialog(true); }}
            onDelete={(event) => { setDeleteEvent(event); setShowDeleteDialog(true); }}
          />
        </table>
      </div>

      <EditEventDialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) setEditEvent(null);
        }}
        event={editEvent}
        venues={venues}
      />

      <DeleteEventDialog
        event={deleteEvent}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default EventsTable;
