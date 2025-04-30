
import React from "react";
import { EventRow } from "./EventRow";
import { EmptyEventsState } from "./EmptyEventsState";
import type { VenueEvent } from "@/hooks/useVenueEvents";

interface EventsTableBodyProps {
  events: VenueEvent[];
  venueMap: Record<string, string>;
  onEdit: (event: VenueEvent) => void;
  onDelete: (event: VenueEvent) => void;
}

export const EventsTableBody: React.FC<EventsTableBodyProps> = ({
  events,
  venueMap,
  onEdit,
  onDelete,
}) => {
  if (events.length === 0) {
    return (
      <tbody>
        <EmptyEventsState />
      </tbody>
    );
  }

  return (
    <tbody>
      {events.map((event) => (
        <EventRow 
          key={event.id} 
          event={event} 
          venueMap={venueMap}
          onEdit={() => onEdit(event)}
          onDelete={() => onDelete(event)}
        />
      ))}
    </tbody>
  );
};
