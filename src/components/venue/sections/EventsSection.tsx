
import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { useVenueEvents } from '@/hooks/useVenueEvents';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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

  const handleInterested = (event: VenueEvent) => {
    // Placeholder for future "interested" functionality
    console.log('Interested in event:', event.title);
  };

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
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar size={14} />
            <span>{format(new Date(event.start_time), "EEE, MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock size={14} />
            <span>
              {format(new Date(event.start_time), "h:mm a")} - {format(new Date(event.end_time), "h:mm a")}
            </span>
          </div>
          {event.max_attendees && (
            <div className="text-sm text-muted-foreground">
              Maximum attendees: {event.max_attendees}
            </div>
          )}
          <div className="pt-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => handleInterested(event)}
            >
              Interested
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsSection;
