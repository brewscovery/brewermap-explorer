
import React, { useState } from 'react';
import { Calendar, Clock, Heart, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useVenueEvents } from '@/hooks/useVenueEvents';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useEventInterest } from '@/hooks/useEventInterest';
import EventExportMenu from './EventExportMenu';
import type { VenueEvent } from '@/hooks/useVenueEvents';
import type { Venue } from '@/types/venue';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

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
  const { isInterested, interestedUsersCount, toggleInterest, isLoading } = useEventInterest(event);
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: venueData } = useQuery({
    queryKey: ['venue', venueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venueId)
        .single();
      if (error) throw error;
      return data as Venue;
    }
  });
  
  const handleToggleInterest = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (user) {
      toggleInterest();
    } else {
      onInterested(event);
    }
  };

  const handleToggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const shouldTruncate = event.description && event.description.length > 100;
  const displayDescription = shouldTruncate && !isExpanded 
    ? `${event.description.slice(0, 100)}...`
    : event.description;

  return (
    <div className="border rounded p-3 space-y-2">
      <h3 className="font-medium">{event.title}</h3>
      {event.description && (
        <div className="text-sm text-muted-foreground">
          <p className="whitespace-pre-wrap">{displayDescription}</p>
          {shouldTruncate && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleToggleDescription}
              className="mt-1 h-6 px-2 text-xs"
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
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Calendar size={14} />
        <span>{new Date(event.start_time).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock size={14} />
        <span>
          {new Date(event.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {new Date(event.end_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>
      
      <div className="text-sm">
        {event.ticket_price === null || event.ticket_price === 0 ? (
          <Badge variant="secondary">Free entry</Badge>
        ) : (
          <Badge variant="secondary">Price: ${event.ticket_price?.toFixed(2) || '0.00'}</Badge>
        )}
        {event.ticket_url && (
          <Button 
            variant="link" 
            className="ml-2 h-6 px-2 text-xs"
            onClick={() => window.open(event.ticket_url, '_blank')}
          >
            Buy tickets <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="pt-1 space-y-2">
        {userType !== 'business' ? (
          <Button 
            variant={isInterested ? "default" : "outline"} 
            size="sm" 
            className="w-full flex items-center gap-2"
            onClick={handleToggleInterest}
            disabled={isLoading}
          >
            {isInterested ? <Heart className="mr-2" /> : <Heart className="mr-2 text-muted-foreground" />}
            Interested {interestedUsersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {interestedUsersCount}
              </Badge>
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Heart size={16} className="text-muted-foreground" />
            <span>Interested users:</span>
            <Badge variant="outline">{interestedUsersCount}</Badge>
          </div>
        )}
        {isInterested && venueData && userType !== 'business' && <EventExportMenu event={event} venue={venueData} />}
      </div>
    </div>
  );
};

export default EventsSection;
