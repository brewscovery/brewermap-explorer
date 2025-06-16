
import React from "react";
import { Calendar, Clock, Heart, ChevronDown, ChevronUp, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { VenueEvent } from "@/hooks/useVenueEvents";
import { Venue } from "@/types/venue";
import { useEventInterest } from "@/hooks/useEventInterest";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/utils/dateTimeUtils";

interface UserEventCardProps {
  event: VenueEvent;
  venue?: Venue;
  isInterested: boolean;
  showInterestButton?: boolean;
}

const UserEventCard = ({ event, venue, isInterested: initialIsInterested, showInterestButton = true }: UserEventCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleInterest, interestedUsersCount, isLoading } = useEventInterest(event);
  
  // Fetch brewery logo if available
  const [breweryLogo, setBreweryLogo] = React.useState<string | null>(null);
  const [breweryName, setBreweryName] = React.useState<string | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  React.useEffect(() => {
    if (venue) {
      const fetchBreweryDetails = async () => {
        const { data, error } = await supabase
          .from('breweries')
          .select('name, logo_url')
          .eq('id', venue.brewery_id)
          .single();
          
        if (!error && data) {
          setBreweryLogo(data.logo_url);
          setBreweryName(data.name);
        }
      };
      
      fetchBreweryDetails();
    }
  }, [venue]);
  
  const handleToggleInterest = () => {
    if (user) {
      toggleInterest();
    } else {
      localStorage.setItem('pendingEventInterest', event.id);
      navigate('/auth');
    }
  };
  
  const handleVenueClick = () => {
    if (venue) {
      navigate(`/?venueId=${venue.id}`);
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
    <Card className="p-4 overflow-hidden hover:shadow-md transition-shadow">
      <div className="mb-3">
        <h3 className="font-medium text-lg">{event.title}</h3>
        
        {/* Venue and brewery info */}
        <div className="flex items-center gap-2 mt-2 mb-3">
          {breweryLogo ? (
            <img 
              src={breweryLogo} 
              alt={breweryName || ""} 
              className="w-8 h-8 rounded-full object-cover border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm font-bold">
                {breweryName?.charAt(0) || 'B'}
              </span>
            </div>
          )}
          
          <div>
            <Button 
              variant="link" 
              className="h-auto p-0 text-foreground font-medium" 
              onClick={handleVenueClick}
            >
              {venue?.name || "Unknown Venue"}
            </Button>
            <div className="text-xs text-muted-foreground">
              {breweryName || ""}
            </div>
          </div>
        </div>
        
        {/* Event description */}
        {event.description && (
          <div className="text-sm text-muted-foreground">
            <p>{displayDescription}</p>
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
      </div>
      
      {/* Date and time */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar size={14} />
          <span>{formatDate(new Date(event.start_time))}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock size={14} />
          <span>
            {new Date(event.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {new Date(event.end_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
        {venue && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={14} />
            <span>
              {venue.city}, {venue.state}
            </span>
          </div>
        )}
      </div>
      
      {/* Price and tickets */}
      <div className="text-sm mb-3">
        {(event.ticket_price === null || event.ticket_price === 0) ? (
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
      
      {/* Interested button - only show if showInterestButton is true */}
      {showInterestButton && (
        <Button 
          variant={initialIsInterested ? "default" : "outline"} 
          size="sm" 
          className="w-full flex items-center gap-2"
          onClick={handleToggleInterest}
          disabled={isLoading}
        >
          {initialIsInterested ? (
            <Heart className="mr-2" />
          ) : (
            <Heart className="mr-2 text-muted-foreground" />
          )}
          Interested {interestedUsersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {interestedUsersCount}
            </Badge>
          )}
        </Button>
      )}
    </Card>
  );
};

export default UserEventCard;
