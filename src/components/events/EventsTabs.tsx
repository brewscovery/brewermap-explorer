import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, History, Loader2, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserEventCard from "./UserEventCard";
import EventsPagination from "./EventsPagination";
import { VenueEvent } from "@/hooks/useVenueEvents";
import { Venue } from "@/types/venue";

interface EventsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  
  // All events data
  events: VenueEvent[];
  eventsLoading: boolean;
  eventsFetching: boolean;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  pageSize: number;
  
  // Past events data
  pastEvents: VenueEvent[];
  pastEventsLoading: boolean;
  pastEventsFetching: boolean;
  pastEventsTotalCount: number;
  pastEventsPage: number;
  onPastEventsPageChange: (page: number) => void;
  pastEventsTotalPages: number;

  // Nearby events data
  nearbyEvents: VenueEvent[];
  nearbyEventsLoading: boolean;
  nearbyEventsFetching: boolean;
  nearbyEventsTotalCount: number;
  nearbyEventsPage: number;
  onNearbyEventsPageChange: (page: number) => void;
  nearbyEventsTotalPages: number;
  
  // Location data
  location: { latitude: number; longitude: number } | null;
  locationLoading: boolean;
  locationError: string | null;
  requestLocation: () => void;
  
  // Other data
  userInterests: string[];
  allVenues: Venue[];
}

const EventsTabs = ({
  activeTab,
  onTabChange,
  events,
  eventsLoading,
  eventsFetching,
  totalCount,
  currentPage,
  onPageChange,
  totalPages,
  pageSize,
  pastEvents,
  pastEventsLoading,
  pastEventsFetching,
  pastEventsTotalCount,
  pastEventsPage,
  onPastEventsPageChange,
  pastEventsTotalPages,
  nearbyEvents,
  nearbyEventsLoading,
  nearbyEventsFetching,
  nearbyEventsTotalCount,
  nearbyEventsPage,
  onNearbyEventsPageChange,
  nearbyEventsTotalPages,
  location,
  locationLoading,
  locationError,
  requestLocation,
  userInterests,
  allVenues
}: EventsTabsProps) => {
  
  const getInterestedEvents = () => {
    return events.filter(event => userInterests.includes(event.id));
  };

  const getEventsWithVenueInfo = () => {
    return events.map(event => {
      const venue = allVenues.find(v => v.id === event.venue_id);
      return { ...event, venue };
    });
  };

  const getPastEventsWithVenueInfo = () => {
    return pastEvents.map(event => {
      const venue = allVenues.find(v => v.id === event.venue_id);
      return { ...event, venue };
    });
  };

  const getNearbyEventsWithVenueInfo = () => {
    return nearbyEvents.map(event => {
      const venue = allVenues.find(v => v.id === event.venue_id);
      return { ...event, venue };
    });
  };

  const renderLocationRequest = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Events Near You
        </CardTitle>
        <CardDescription>
          Discover events within 50km of your location
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            <AlertCircle size={32} className="text-muted-foreground"/>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              User location unknown, please give Brewscovery location access
            </p>
            {locationError && (
              <p className="text-sm text-destructive">
                {locationError}
              </p>
            )}
          </div>
          <Button 
            onClick={requestLocation}
            disabled={locationLoading}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            {locationLoading ? 'Getting location...' : 'Enable Location Access'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="interested" className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          My Events
        </TabsTrigger>
        <TabsTrigger value="all" className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          All Events ({totalCount})
        </TabsTrigger>
        <TabsTrigger value="nearby" className="flex items-center">
          <MapPin className="mr-2 h-4 w-4" />
          Events Near Me
        </TabsTrigger>
        <TabsTrigger value="past" className="flex items-center">
          <History className="mr-2 h-4 w-4" />
          My Past Events
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        {eventsLoading || eventsFetching ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Loading events...</p>
          </div>
        ) : getEventsWithVenueInfo().length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getEventsWithVenueInfo().map(event => (
                <UserEventCard 
                  key={event.id} 
                  event={event} 
                  venue={event.venue}
                  isInterested={userInterests.includes(event.id)}
                />
              ))}
            </div>
            <EventsPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              totalCount={totalCount}
              pageSize={pageSize}
            />
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming events found. Try adjusting your search criteria.
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="interested">
        {eventsLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Loading events...</p>
          </div>
        ) : getInterestedEvents().length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getInterestedEvents().map(event => {
              const venue = allVenues.find(v => v.id === event.venue_id);
              return (
                <UserEventCard 
                  key={event.id} 
                  event={event} 
                  venue={venue}
                  isInterested={true}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            You haven't marked any upcoming events as interested.
          </div>
        )}
      </TabsContent>

      <TabsContent value="nearby">
        {!location ? (
          renderLocationRequest()
        ) : nearbyEventsLoading || nearbyEventsFetching ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Loading nearby events...</p>
          </div>
        ) : getNearbyEventsWithVenueInfo().length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getNearbyEventsWithVenueInfo().map(event => (
                <UserEventCard 
                  key={event.id} 
                  event={event} 
                  venue={event.venue}
                  isInterested={userInterests.includes(event.id)}
                  showDistance={true}
                  userLocation={location}
                />
              ))}
            </div>
            <EventsPagination 
              currentPage={nearbyEventsPage}
              totalPages={nearbyEventsTotalPages}
              onPageChange={onNearbyEventsPageChange}
              totalCount={nearbyEventsTotalCount}
              pageSize={pageSize}
            />
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No events found within 50km of your location.
          </div>
        )}
      </TabsContent>

      <TabsContent value="past">
        {pastEventsLoading || pastEventsFetching ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Loading past events...</p>
          </div>
        ) : getPastEventsWithVenueInfo().length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getPastEventsWithVenueInfo().map(event => (
                <UserEventCard 
                  key={event.id} 
                  event={event} 
                  venue={event.venue}
                  isInterested={true}
                  showInterestButton={false}
                />
              ))}
            </div>
            <EventsPagination 
              currentPage={pastEventsPage}
              totalPages={pastEventsTotalPages}
              onPageChange={onPastEventsPageChange}
              totalCount={pastEventsTotalCount}
              pageSize={pageSize}
            />
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            You haven't shown interest in any past events yet.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default EventsTabs;
