import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, History, Loader2 } from "lucide-react";
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
