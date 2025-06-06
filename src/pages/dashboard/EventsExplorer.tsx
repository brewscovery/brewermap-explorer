
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

const EventsExplorer = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Array<VenueEvent & { venue?: Venue }>>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [manualInputChange, setManualInputChange] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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
    };
    
    fetchVenues();
  }, []);
  
  // Fetch all events 
  const { data: allEvents = [], isLoading: eventsLoading } = useMultipleVenueEvents(
    allVenues.map(v => v.id)
  );
  
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
  
  // Process events with venue information
  useEffect(() => {
    const processEvents = () => {
      const enrichedEvents = allEvents.map(event => {
        const venue = allVenues.find(v => v.id === event.venue_id);
        return { ...event, venue };
      });
      
      // Filter out past events
      const upcomingEvents = enrichedEvents.filter(event => {
        return new Date(event.start_time) >= new Date();
      });
      
      // Sort by date
      return upcomingEvents.sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
    };
    
    if (!eventsLoading && allEvents.length > 0 && allVenues.length > 0) {
      const processed = processEvents();
      setFilteredEvents(processed);
    }
  }, [allEvents, allVenues, eventsLoading]);
  
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
      // Reset to show all upcoming events
      const processed = allEvents.map(event => {
        const venue = allVenues.find(v => v.id === event.venue_id);
        return { ...event, venue };
      }).filter(event => new Date(event.start_time) >= new Date())
        .sort((a, b) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      
      setFilteredEvents(processed);
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
        // Filter events based on venues in the returned data
        const cityVenueIds = data.map((venue: Venue) => venue.id);
        
        const filtered = allEvents
          .filter(event => cityVenueIds.includes(event.venue_id))
          .map(event => {
            // Find the venue from either the geocode results or our local venues
            const venueFromGeocode = data.find((v: Venue) => v.id === event.venue_id);
            const venue = venueFromGeocode || allVenues.find(v => v.id === event.venue_id);
            return { ...event, venue };
          })
          .filter(event => new Date(event.start_time) >= new Date())
          .sort((a, b) => 
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          );
          
        setFilteredEvents(filtered);
      } else {
        // No results found for this city
        setFilteredEvents([]);
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
    
    // Reset to default state if needed
    handleSearch();
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
    return filteredEvents.filter(event => userInterests.includes(event.id));
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
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="interested" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
                My Events
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
                All Events
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {eventsLoading ? (
            <div className="text-center py-8">Loading events...</div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map(event => (
                <UserEventCard 
                  key={event.id} 
                  event={event} 
                  venue={event.venue}
                  isInterested={userInterests.includes(event.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming events found. Try adjusting your search criteria.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="interested">
          {eventsLoading ? (
            <div className="text-center py-8">Loading events...</div>
          ) : getInterestedEvents().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getInterestedEvents().map(event => (
                <UserEventCard 
                  key={event.id} 
                  event={event} 
                  venue={event.venue}
                  isInterested={true}
                />
              ))}
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
