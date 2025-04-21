
import React from "react";
import { useVenueEvents, VenueEvent } from "@/hooks/useVenueEvents";
import { useBreweryVenues } from "@/hooks/useBreweryVenues";
import { format } from "date-fns";

interface EventsTableProps {
  venueIds: string[];
}

const EventsTable: React.FC<EventsTableProps> = ({ venueIds }) => {
  // aggregate all events from all venues
  const allEvents: VenueEvent[] = [];
  let isLoading = false;

  // We fetch events per venue
  venueIds.forEach((venueId) => {
    const { data, isLoading: venueLoading } = useVenueEvents(venueId);
    if (venueLoading) isLoading = true;
    if (data) allEvents.push(...data);
  });

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
          </tr>
        </thead>
        <tbody>
          {allEvents.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-4 text-center text-muted-foreground">
                No events found.
              </td>
            </tr>
          ) : (
            allEvents.map((event) => (
              <tr key={event.id} className="hover:bg-muted/30">
                <td className="py-1">{event.title}</td>
                <td className="py-1">{event.venue_id}</td>
                <td className="py-1">{format(new Date(event.start_time), "PPPp")}</td>
                <td className="py-1">{format(new Date(event.end_time), "PPPp")}</td>
                <td className="py-1">{event.is_published ? "Yes" : "No"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EventsTable;
