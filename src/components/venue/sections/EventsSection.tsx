
import React from 'react';
import { format } from 'date-fns';
import { useVenueEvents } from '@/hooks/useVenueEvents';
import { useAuth } from '@/contexts/AuthContext';
import type { VenueEvent } from '@/hooks/useVenueEvents';

interface EventsSectionProps {
  venueId: string;
}

const EventsSection = ({ venueId }: EventsSectionProps) => {
  const { data: events = [], isLoading } = useVenueEvents(venueId);
  const { user } = useAuth();

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  // Filter for upcoming events
  const upcomingEvents = sortedEvents.filter(event => {
    const eventDate = new Date(event.start_time);
    return eventDate >= new Date();
  });

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading events...
      </div>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No upcoming events scheduled
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {upcomingEvents.map((event) => (
        <div key={event.id} className="border rounded p-3 space-y-2">
          <h3 className="font-medium">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          )}
          <div className="text-sm text-muted-foreground">
            {format(new Date(event.start_time), "PPP 'at' p")}
          </div>
          {event.max_attendees && (
            <div className="text-sm text-muted-foreground">
              Maximum attendees: {event.max_attendees}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EventsSection;
