
import React from "react";
import { format } from "date-fns";
import { useVenueEvents } from "@/hooks/useVenueEvents";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import type { VenueEvent } from "@/hooks/useVenueEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface EventsSectionProps {
  venueId: string;
}

export default function EventsSection({ venueId }: EventsSectionProps) {
  const { data: events = [] } = useVenueEvents(venueId);
  const { user } = useAuth();

  // Filter for upcoming events and sort by date
  const upcomingEvents = events
    .filter(event => new Date(event.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  if (upcomingEvents.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No upcoming events scheduled
      </div>
    );
  }

  const handleInterestClick = (event: VenueEvent) => {
    if (!user) {
      // Store event ID in localStorage before redirecting to login
      localStorage.setItem('pendingEventInterest', event.id);
      // TODO: Redirect to login page
    } else {
      // TODO: Handle marking interest for logged-in users
    }
  };

  // Group events by date
  const eventsByDate = upcomingEvents.reduce((acc, event) => {
    const date = format(new Date(event.start_time), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, VenueEvent[]>);

  return (
    <div className="space-y-6 p-4">
      {Object.entries(eventsByDate).map(([date, dateEvents]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
          </h3>
          <div className="space-y-4">
            {dateEvents.map((event) => (
              <Card key={event.id} className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  <Button
                    variant="secondary"
                    className="mt-4 w-full"
                    onClick={() => handleInterestClick(event)}
                  >
                    I'm Interested
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {Object.keys(eventsByDate).indexOf(date) < Object.keys(eventsByDate).length - 1 && (
            <Separator className="my-6" />
          )}
        </div>
      ))}
    </div>
  );
}
