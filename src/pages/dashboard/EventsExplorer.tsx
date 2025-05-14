
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMultipleVenueEvents, VenueEvent } from "@/hooks/useVenueEvents";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MapPin, X, Loader2 } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Venue } from "@/types/venue";
import { Button } from "@/components/ui/button";
import UserEventCard from "@/components/events/UserEventCard";
import { useCitySearch, CityResult } from "@/hooks/useCitySearch";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EventsExplorer = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"venue" | "city">("venue");
  const [loading, setLoading] = useState(false);
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Array<VenueEvent & { venue?: Venue }>>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [openCityPopover, setOpenCityPopover] = useState(false);
  const { cities, isLoading: citiesLoading } = useCitySearch(searchType === "city" ? searchTerm : "");
  const inputRef = useRef<HTMLInputElement>(null);
  
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
      if (searchType === "venue") {
        // Search by venue name
        const filteredVenues = allVenues.filter(
          venue => venue.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const venueIds = filteredVenues.map(v => v.id);
        
        const filtered = allEvents
          .filter(event => venueIds.includes(event.venue_id))
          .map(event => {
            const venue = allVenues.find(v => v.id === event.venue_id);
            return { ...event, venue };
          })
          .filter(event => new Date(event.start_time) >= new Date())
          .sort((a, b) => 
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          );
          
        setFilteredEvents(filtered);
      } else {
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
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCitySelect = (city: string) => {
    // Close the popover immediately
    setOpenCityPopover(false);
    
    // Set the search term
    setSearchTerm(city);
    
    // Trigger search immediately after selection
    handleSearch();
  };
  
  const handleClearSearch = () => {
    setSearchTerm("");
    setOpenCityPopover(false);
  };
  
  // Handle input change for city search
  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Only open dropdown if there's text in the input
    if (value.length > 1) {
      setOpenCityPopover(true);
    } else {
      setOpenCityPopover(false);
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
          {searchType === "venue" ? (
            <>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Search size={18} />
              </div>
              <Input
                ref={inputRef}
                placeholder="Search events by venue name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            </>
          ) : (
            <Popover open={openCityPopover} onOpenChange={setOpenCityPopover}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <MapPin size={18} />
                  </div>
                  <Input
                    ref={inputRef}
                    placeholder="Search events by city"
                    value={searchTerm}
                    onChange={handleCityInputChange}
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
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[300px]" align="start">
                <Command>
                  <CommandList>
                    {citiesLoading && (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <p className="text-sm text-muted-foreground">Searching cities...</p>
                      </div>
                    )}
                    <CommandEmpty>No cities found</CommandEmpty>
                    <CommandGroup>
                      {cities.map((city, index) => (
                        <CommandItem 
                          key={index} 
                          value={city.city}
                          onSelect={() => handleCitySelect(city.city)}
                          className="cursor-pointer"
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          <div className="flex flex-col">
                            <span>{city.city}</span>
                            <span className="text-xs text-muted-foreground">
                              {[city.state, city.country].filter(Boolean).join(", ")}
                              {city.count > 0 && ` • ${city.count} venue${city.count !== 1 ? 's' : ''}`}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Select
            value={searchType}
            onValueChange={(value) => {
              setSearchType(value as "venue" | "city");
              setSearchTerm(""); // Reset search term when changing search type
              setOpenCityPopover(false); // Close popover when changing search type
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="venue">Venue Name</SelectItem>
              <SelectItem value="city">City (50km radius)</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
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
