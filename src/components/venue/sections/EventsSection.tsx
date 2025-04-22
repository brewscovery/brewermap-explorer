import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Heart } from 'lucide-react';
import { useVenueEvents } from '@/hooks/useVenueEvents';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useEventInterest } from '@/hooks/useEventInterest';
import EventExportMenu from './EventExportMenu';
import type { VenueEvent } from '@/hooks/useVenueEvents';
import { useNavigate } from 'react-router-dom';

interface EventsSectionProps {
  venueId: string;
}

const EventsSection = ({ venueId }: EventsSectionProps) => {
  const { data: events = [], isLoading } = useVenueEvents(venueId);
  const { user } = useAuth();
  const navigate = useNavigate();

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const upcomingEvents = sortedEvents.filter(event => {
    const eventDate = new Date(event.start_time);
    return eventDate >= new Date();
  });

  const handleInterested = (event: VenueEvent) => {
    if (!user) {
      localStorage.setItem('pendingEventInterest', event.id);
      navigate('/auth');
      return;
    }
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
        <EventCard key={event.id} event={event} onInterested={handleInterested} venueId={venueId} />
      ))}
    </div>
  );
};

const EventCard = ({ 
  event, 
  onInterested,
  venueId 
}: { 
  event: VenueEvent;
  onInterested: (event: VenueEvent) => void;
  venueId: string;
}) => {
  const { user, userType } = useAuth();
  const { isInterested, toggleInterest, isLoading } = useEventInterest(event);
  const { data: venues = [] } = useVenueEvents(venueId);
  const venue = venues[0]; // We know this venue exists since we're displaying its events

  const handleToggleInterest = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (user) {
      toggleInterest();
    } else {
      onInterested(event);
    }
  };

  return (
    <div className="border rounded p-3 space-y-2">
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
      {userType !== 'business' && (
        <div className="pt-1 space-y-2">
          <Button 
            variant={isInterested ? "default" : "outline"} 
            size="sm" 
            className="w-full flex items-center gap-2"
            onClick={handleToggleInterest}
            disabled={isLoading}
          >
            {isInterested ? <Heart className="mr-2" /> : <Heart className="mr-2 text-muted-foreground" />}
            Interested {isInterested ? "" : ""}
          </Button>
          {isInterested && venue && <EventExportMenu event={event} venue={venue} />}
        </div>
      )}
    </div>
  );
};

export default EventsSection;
