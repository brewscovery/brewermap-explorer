import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useVenueEvents, useDeleteVenueEvent } from "@/hooks/useVenueEvents";
import { supabase } from '@/integrations/supabase/client';
import EditEventDialog from "../EditEventDialog";
import { toast } from "sonner";
import { EventRow } from "./EventRow";
import { DeleteEventDialog } from "./DeleteEventDialog";
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

  if (venueIds.length === 0) {
    return <div>No venues found. Please create a venue to add events.</div>;
  }

  if (isLoading) {
    return <div>Loading events...</div>;
  }

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
            <th className="py-1">
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>Interest</span>
              </div>
            </th>
            <th className="py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {allEvents.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-4 text-center text-muted-foreground">
                No events found.
              </td>
            </tr>
          ) : (
            allEvents.map((event) => (
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
