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
import type { EventsTableProps } from "./types";
import type { VenueEvent } from "@/hooks/useVenueEvents";

const EventsTable: React.FC<EventsTableProps> = ({ venueIds, venues }) => {
  const queryClient = useQueryClient();
  const [allEvents, setAllEvents] = useState<VenueEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: eventsData, isLoading: eventsLoading } = useVenueEvents(venueIds.length > 0 ? venueIds[0] : null);
  const venueMap = Object.fromEntries(venues.map(v => [v.id, v.name]));

  const [editEvent, setEditEvent] = useState<VenueEvent | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteEvent, setDeleteEvent] = useState<VenueEvent | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteMutation = useDeleteVenueEvent();

  React.useEffect(() => {
    if (venueIds.length === 0) {
      setAllEvents([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(eventsLoading);
    
    if (eventsData) {
      const fetchAllEvents = async () => {
        const promises = venueIds.slice(1).map(async (venueId) => {
          const data = await queryClient.fetchQuery({
            queryKey: ['venueEvents', venueId],
            queryFn: async () => {
              const { data, error } = await supabase
                .from('venue_events')
                .select('*')
                .eq('venue_id', venueId)
                .order('start_time', { ascending: true });
              if (error) throw error;
              return data as VenueEvent[];
            }
          });
          return data || [];
        });
        
        try {
          const otherVenuesEvents = await Promise.all(promises);
          const allEventsCollection = [
            ...(eventsData || []),
            ...otherVenuesEvents.flat()
          ];
          
          allEventsCollection.sort((a, b) => b.start_time.localeCompare(a.start_time));
          
          setAllEvents(allEventsCollection);
        } catch (error) {
          console.error("Error fetching events for all venues:", error);
          toast.error("Failed to load some events");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchAllEvents();
    }
  }, [venueIds, eventsData, eventsLoading, queryClient]);

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

  if (venueIds.length === 0) {
    return <div>No venues found. Please create a venue to add events.</div>;
  }

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="bg-white shadow rounded p-4">
      <EventsFilters
        venues={venues}
        selectedVenue={selectedVenue}
        onVenueChange={setSelectedVenue}
        publishedFilter={publishedFilter}
        onPublishedChange={setPublishedFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      <table className="min-w-full text-sm border-separate border-spacing-y-1">
        <thead>
          <tr className="text-left">
            <TableHeader
              label="Title"
              sortField="title"
              currentSort={sortField}
              sortDirection={sortDirection}
              onSort={() => toggleSort('title')}
            />
            <TableHeader
              label="Venue"
              sortField="venue_id"
              currentSort={sortField}
              sortDirection={sortDirection}
              onSort={() => toggleSort('venue_id')}
            />
            <TableHeader
              label="Start"
              sortField="start_time"
              currentSort={sortField}
              sortDirection={sortDirection}
              onSort={() => toggleSort('start_time')}
            />
            <TableHeader
              label="End"
              sortField="end_time"
              currentSort={sortField}
              sortDirection={sortDirection}
              onSort={() => toggleSort('end_time')}
            />
            <TableHeader
              label="Published"
              sortField="is_published"
              currentSort={sortField}
              sortDirection={sortDirection}
              onSort={() => toggleSort('is_published')}
            />
            <TableHeader
              label="Interest"
              sortField="interest"
              currentSort={sortField}
              sortDirection={sortDirection}
              onSort={() => toggleSort('interest')}
            />
            <th className="py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedAndFilteredEvents.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-4 text-center text-muted-foreground">
                No events found.
              </td>
            </tr>
          ) : (
            sortedAndFilteredEvents.map((event) => (
              <EventRow 
                key={event.id} 
                event={event} 
                venueMap={venueMap}
                onEdit={() => { setEditEvent(event); setShowEditDialog(true); }}
                onDelete={() => { setDeleteEvent(event); setShowDeleteDialog(true); }}
              />
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
