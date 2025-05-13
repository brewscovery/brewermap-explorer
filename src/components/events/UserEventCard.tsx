
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEventInterest } from '@/hooks/useEventInterest';
import { VenueEvent } from '@/types/venue';
import { Badge } from '@/components/ui/badge';

interface UserEventCardProps {
  event: VenueEvent;
  showVenueName?: boolean;
}

const UserEventCard = ({ event, showVenueName = false }: UserEventCardProps) => {
  const { isInterested, toggleInterest, isLoading } = useEventInterest(event.id);

  const formatEventTime = (date: string) => {
    return format(new Date(date), 'h:mm a');
  };

  const formatEventDate = (date: string) => {
    return format(new Date(date), 'EEEE, MMMM d, yyyy');
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
        <h3 className="text-lg font-semibold line-clamp-2">{event.title}</h3>
        {showVenueName && event.venue_name && (
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin size={14} className="mr-1" />
            {event.venue_name}
          </div>
        )}
      </div>
      <CardContent className="p-4 pt-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <CalendarDays size={16} className="mr-2 text-primary" />
            {formatEventDate(event.start_date)}
          </div>
          <div className="flex items-center text-sm">
            <Clock size={16} className="mr-2 text-primary" />
            {formatEventTime(event.start_date)} - {formatEventTime(event.end_date)}
          </div>
          {event.max_attendees > 0 && (
            <div className="flex items-center text-sm">
              <Users size={16} className="mr-2 text-primary" />
              {event.max_attendees} max attendees
            </div>
          )}
          {event.categories && event.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {event.categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-sm">
          {event.ticket_price > 0 ? (
            <span className="font-medium">${event.ticket_price.toFixed(2)}</span>
          ) : (
            <span className="text-emerald-600 font-medium">Free</span>
          )}
        </div>
        <Button 
          size="sm"
          onClick={() => toggleInterest(event.id)}
          variant={isInterested ? "default" : "outline"}
          disabled={isLoading}
        >
          {isInterested ? "Interested" : "Mark Interest"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserEventCard;
