
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBreweryFetching } from "@/hooks/useBreweryFetching";
import { useBreweryVenues } from "@/hooks/useBreweryVenues";
import EventsTable from "@/components/brewery/events/EventsTable";
import CreateEventDialog from "@/components/brewery/events/CreateEventDialog";
import { Button } from "@/components/ui/button";
import { useVenueEvents } from "@/hooks/useVenueEvents";

const EventsPage = () => {
  const { user, userType } = useAuth();
  const { selectedBrewery } = useBreweryFetching(userType === "business" ? user?.id : null);
  const { venues, isLoading: venuesLoading } = useBreweryVenues(selectedBrewery ? selectedBrewery.id : null);

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const venueIds = venues && venues.length > 0 ? venues.map(v => v.id) : [];
  // Do not filter by venueId for business user—all accessible
  // Loading and error state handled in EventsTable

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <span className="mr-2"><Plus size={16} /></span>
          Create Event
        </Button>
      </div>
      <EventsTable venueIds={venueIds} />
      <CreateEventDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        venues={venues}
        defaultVenueId={venues[0]?.id || ""}
      />
    </div>
  );
};

export default EventsPage;
