
import React from "react";
import { useMultipleVenueEvents } from "@/hooks/useVenueEvents";
import { usePastInterestedEvents } from "@/hooks/usePastInterestedEvents";
import { useEventsExplorer } from "@/hooks/useEventsExplorer";
import EventsSearch from "@/components/events/EventsSearch";
import EventsTabs from "@/components/events/EventsTabs";

const EventsExplorer = () => {
  const {
    searchTerm,
    setSearchTerm,
    allVenues,
    filteredVenueIds,
    setFilteredVenueIds,
    userInterests,
    currentPage,
    setCurrentPage,
    pastEventsPage,
    setPastEventsPage,
    activeTab,
    setActiveTab,
    pageSize
  } = useEventsExplorer();

  // Fetch events with pagination
  const { data: eventsResponse, isLoading: eventsLoading, isFetching } = useMultipleVenueEvents(
    filteredVenueIds,
    currentPage,
    pageSize
  );
  
  // Fetch past interested events with pagination
  const { data: pastEventsResponse, isLoading: pastEventsLoading, isFetching: pastEventsFetching } = usePastInterestedEvents(
    pastEventsPage,
    pageSize
  );
  
  const events = eventsResponse?.events || [];
  const totalCount = eventsResponse?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  const pastEvents = pastEventsResponse?.events || [];
  const pastEventsTotalCount = pastEventsResponse?.totalCount || 0;
  const pastEventsTotalPages = Math.ceil(pastEventsTotalCount / pageSize);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Explore Events</h1>
      
      <EventsSearch 
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onVenueIdsChange={setFilteredVenueIds}
        allVenues={allVenues}
      />
      
      <EventsTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        events={events}
        eventsLoading={eventsLoading}
        eventsFetching={isFetching}
        totalCount={totalCount}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        pastEvents={pastEvents}
        pastEventsLoading={pastEventsLoading}
        pastEventsFetching={pastEventsFetching}
        pastEventsTotalCount={pastEventsTotalCount}
        pastEventsPage={pastEventsPage}
        onPastEventsPageChange={setPastEventsPage}
        pastEventsTotalPages={pastEventsTotalPages}
        userInterests={userInterests}
        allVenues={allVenues}
      />
    </div>
  );
};

export default EventsExplorer;
