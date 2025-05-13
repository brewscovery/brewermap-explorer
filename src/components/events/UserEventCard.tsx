
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Heart, MapPin, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEventInterest } from '@/hooks/useEventInterest';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import type { VenueEvent } from '@/hooks/useVenueEvents';
import type { Venue } from '@/types/venue';

interface UserEventCardProps {
  event: VenueEvent;
  venue?: Venue;
  isInterested?: boolean;
}

const UserEventCard = ({ event, venue, isInterested: initialInterest = false }: UserEventCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { 
    isInterested,
    interestedUsersCount,
    toggleInterest,
    isLoading
  } = useEventInterest(event, initialInterest);
  
  const handleToggleInterest = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to mark events as interested",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    await toggleInterest();
  };
  
  const handleToggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const eventDate = new Date(event.start_time);
  const isPastEvent = eventDate < new Date();
  
  const shouldTruncate = event.description && event.description.length > 120;
  const displayDescription = shouldTruncate && !isExpanded 
    ? `${event.description.slice(0, 120)}...`
    : event.description;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{event.title}</CardTitle>
        {venue && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="truncate">{venue.name}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow pb-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <Calendar size={14} className="flex-shrink-0" />
          <span>{format(new Date(event.start_time), "EEE, MMM d, yyyy")}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <Clock size={14} className="flex-shrink-0" />
          <span>{format(new Date(event.start_time), "h:mm a")} - {format(new Date(event.end_time), "h:mm a")}</span>
        </div>
        
        {event.description && (
          <div className="mt-3 text-sm">
            <p>{displayDescription}</p>
            {shouldTruncate && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleToggleDescription}
                className="mt-1 h-6 px-2 py-1 text-xs"
              >
                {isExpanded ? (
                  <>
                    Show less <ChevronUp className="ml-1 h-3 w-3" />
                  </>
                ) : (
                  <>
                    Read more <ChevronDown className="ml-1 h-3 w-3" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col pt-0">
        <div className="flex w-full justify-between items-center mb-3">
          {event.ticket_price === null || event.ticket_price === 0 ? (
            <Badge variant="secondary">Free entry</Badge>
          ) : (
            <Badge variant="secondary">Price: ${event.ticket_price?.toFixed(2) || '0.00'}</Badge>
          )}
          
          {event.ticket_url && (
            <Button 
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => window.open(event.ticket_url, '_blank')}
            >
              Tickets <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
        
        {!isPastEvent && (
          <Button 
            variant={isInterested ? "default" : "outline"}
            size="sm"
            className="w-full flex items-center gap-2"
            onClick={handleToggleInterest}
            disabled={isLoading}
          >
            {isInterested ? <Heart className="mr-2" fill="#f43f5e" stroke="#f43f5e" /> : <Heart className="mr-2" />}
            {isInterested ? "Interested" : "Mark as interested"}
            {interestedUsersCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {interestedUsersCount}
              </Badge>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default UserEventCard;
