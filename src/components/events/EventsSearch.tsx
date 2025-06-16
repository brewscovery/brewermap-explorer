
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, X, Loader2 } from "lucide-react";
import { useCitySearch } from "@/hooks/useCitySearch";
import { supabase } from "@/integrations/supabase/client";
import { Venue } from "@/types/venue";

interface EventsSearchProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onVenueIdsChange: (venueIds: string[]) => void;
  allVenues: Venue[];
}

const EventsSearch = ({ searchTerm, onSearchTermChange, onVenueIdsChange, allVenues }: EventsSearchProps) => {
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [manualInputChange, setManualInputChange] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { cities: cityResults, isLoading: citySearchLoading } = useCitySearch(
    manualInputChange ? searchTerm : ""
  );

  // Update dropdown visibility based on search results
  useEffect(() => {
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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      onVenueIdsChange(allVenues.map(v => v.id));
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('geocode-city', {
        body: { city: searchTerm }
      });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const cityVenueIds = data.map((venue: Venue) => venue.id);
        onVenueIdsChange(cityVenueIds);
      } else {
        onVenueIdsChange([]);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
      setIsDropdownOpen(false);
    }
  };

  const handleCitySelect = (city: string) => {
    setManualInputChange(false);
    onSearchTermChange(city);
    setIsDropdownOpen(false);
    
    setTimeout(() => {
      handleSearch();
    }, 0);
  };

  const handleClearSearch = () => {
    setManualInputChange(false);
    onSearchTermChange("");
    setIsDropdownOpen(false);
    onVenueIdsChange(allVenues.map(v => v.id));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualInputChange(true);
    onSearchTermChange(value);
    
    if (value.length > 1) {
      // City search will be triggered by the useCitySearch hook
    } else {
      setIsDropdownOpen(false);
    }
  };

  return (
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
  );
};

export default EventsSearch;
