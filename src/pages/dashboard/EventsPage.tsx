
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBreweryFetching } from "@/hooks/useBreweryFetching";
import { useBreweryVenues } from "@/hooks/useBreweryVenues";
import EventsViewToggle from "@/components/brewery/events/EventsViewToggle";
import CreateEventDialog from "@/components/brewery/events/CreateEventDialog";
import { Button } from "@/components/ui/button";
import { useVenueEvents, useMultipleVenueEvents } from "@/hooks/useVenueEvents";

const EventsPage = () => {
  const { user, userType } = useAuth();
  const { selectedBrewery } = useBreweryFetching(userType === "business" ? user?.id : null);
  const { venues, isLoading: venuesLoading } = useBreweryVenues(selectedBrewery ? selectedBrewery.id : null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Get all venue IDs
  const venueIds = venues && venues.length > 0 ? venues.map(v => v.id) : [];
  
  // Fetch events for all venues
  const { data: allEvents = [], isLoading: eventsLoading } = useMultipleVenueEvents(venueIds);

  const isLoading = venuesLoading || eventsLoading;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <span className="mr-2"><Plus size={16} /></span>
          Create Event
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center p-8">Loading events...</div>
      ) : venues && venues.length > 0 ? (
        <EventsViewToggle 
          events={allEvents} 
          venues={venues} 
          venueIds={venueIds} 
        />
      ) : (
        <div className="text-center p-8">
          No venues found. Please create a venue to add events.
        </div>
      )}
      
      {venues && venues.length > 0 && (
        <CreateEventDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          venues={venues}
          defaultVenueId={venues[0]?.id || ""}
        />
      )}
    </div>
  );
};

export default EventsPage;
