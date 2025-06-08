
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMultipleVenueEvents, VenueEvent } from "@/hooks/useVenueEvents";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Calendar, X, Loader2, MapPin } from "lucide-react";
import { Venue } from "@/types/venue";
import { Button } from "@/components/ui/button";
import UserEventCard from "@/components/events/UserEventCard";
import { toast } from "@/components/ui/use-toast";
import { useCitySearch, CityResult } from "@/hooks/useCitySearch";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const EventsExplorer = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [filteredVenueIds, setFilteredVenueIds] = useState<string[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [manualInputChange, setManualInputChange] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const pageSize = 12;
  
  // Use the custom hook for city search
  const { cities: cityResults, isLoading: citySearchLoading } = useCitySearch(
    manualInputChange ? searchTerm : ""
  );
  
  // Fetch all venues for reference
  useEffect(() => {
    const fetchVenues = async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*');
      
      if (error) {
        console.error("Error fetching venues:", error);
        return;
      }
      
      setAllVenues(data as Venue[]);
      setFilteredVenueIds(data.map(v => v.id));
    };
    
    fetchVenues();
  }, []);
  
  // Fetch events with pagination
  const { data: eventsResponse, isLoading: eventsLoading, isFetching } = useMultipleVenueEvents(
    filteredVenueIds,
    currentPage,
    pageSize
  );
  
  const events = eventsResponse?.events || [];
  const totalCount = eventsResponse?.totalCount || 0;
  const hasMore = eventsResponse?.hasMore || false;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Fetch user's interested events
  useEffect(() => {
    if (!user) return;
    
    const fetchUserInterests = async () => {
      const { data, error } = await supabase
        .from('event_interests')
        .select('event_id')
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Error fetching user interests:", error);
        return;
      }
      
      setUserInterests(data.map(item => item.event_id));
    };
    
    fetchUserInterests();
  }, [user]);
  
  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredVenueIds]);
  
  // Update dropdown visibility based on search results
  useEffect(() => {
    // Only show dropdown if it's a manual input change and we have results
    if (manualInputChange && cityResults.length > 0) {
      setIsDropdownOpen(true);
    }
  }, [cityResults, manualInputChange]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // Reset to show all venues
      setFilteredVenueIds(allVenues.map(v => v.id));
      return;
    }
    
    setLoading(true);
    
    try {
      // Search by city with geocoding - 50km radius
      const { data, error } = await supabase.functions.invoke('geocode-city', {
        body: { city: searchTerm }
      });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Filter venues based on venues in the returned data
        const cityVenueIds = data.map((venue: Venue) => venue.id);
        setFilteredVenueIds(cityVenueIds);
      } else {
        // No results found for this city
        setFilteredVenueIds([]);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
      setIsDropdownOpen(false);
    }
  };
  
  const handleCitySelect = (city: string) => {
    // Flag this as a programmatic change (not manual input)
    setManualInputChange(false);
    
    // Update search term with selected city
    setSearchTerm(city);
    
    // Close dropdown
    setIsDropdownOpen(false);
    
    // Trigger search
    setTimeout(() => {
      handleSearch();
    }, 0);
  };
  
  const handleClearSearch = () => {
    // Flag as programmatic change
    setManualInputChange(false);
    
    setSearchTerm("");
    setIsDropdownOpen(false);
    
    // Reset to default state
    setFilteredVenueIds(allVenues.map(v => v.id));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Flag this as a manual input change
    setManualInputChange(true);
    
    setSearchTerm(value);
    
    if (value.length > 1) {
      // City search will be triggered by the useCitySearch hook
      // Dropdown visibility is managed by the useEffect that watches cityResults
    } else {
      setIsDropdownOpen(false);
    }
  };
  
  const getInterestedEvents = () => {
    return events.filter(event => userInterests.includes(event.id));
  };

  const getEventsWithVenueInfo = () => {
    return events.map(event => {
      const venue = allVenues.find(v => v.id === event.venue_id);
      return { ...event, venue };
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => handlePageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Explore Events</h1>
      
      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 mb-6">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <MapPin size={18} />
          </div>
          <Input
            ref={inputRef}
            placeholder="Search events by city (50km radius)"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => manualInputChange && searchTerm.length > 1 && setIsDropdownOpen(true)}
            className="pl-10 pr-10"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {searchTerm && (
            <button 
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
          
          {/* Dropdown for city results */}
          {isDropdownOpen && (
            <div 
              ref={dropdownRef}
              className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white rounded-md shadow-lg z-50"
            >
              {citySearchLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <p className="text-sm text-muted-foreground">Searching cities...</p>
                </div>
              ) : cityResults.length > 0 ? (
                <div className="py-1">
                  {cityResults.map((city, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleCitySelect(city.city)}
                    >
                      <div className="flex items-start">
                        <MapPin className="mr-2 h-4 w-4 mt-0.5" />
                        <div>
                          <div className="font-medium">{city.city}</div>
                          <div className="text-xs text-gray-500">
                            {[city.state, city.country].filter(Boolean).join(", ")}
                            {city.count > 0 && ` • ${city.count} venue${city.count !== 1 ? 's' : ''}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm.length > 1 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No cities found matching "{searchTerm}"
                </div>
              ) : null}
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="interested" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            My Events
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            All Events ({totalCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {eventsLoading || isFetching ? (
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
              {renderPagination()}
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
      </Tabs>
    </div>
  );
};

export default EventsExplorer;
