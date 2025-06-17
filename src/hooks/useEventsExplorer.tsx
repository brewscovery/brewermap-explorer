
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Venue } from "@/types/venue";
import { useGeolocation } from "@/hooks/useGeolocation";
import { calculateDistance } from "@/utils/distanceUtils";

export const useEventsExplorer = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [filteredVenueIds, setFilteredVenueIds] = useState<string[]>([]);
  const [nearbyVenueIds, setNearbyVenueIds] = useState<string[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pastEventsPage, setPastEventsPage] = useState(1);
  const [nearbyEventsPage, setNearbyEventsPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  const pageSize = 10;

  // Add geolocation hook
  const { 
    location, 
    isLoading: locationLoading, 
    error: locationError, 
    requestLocation 
  } = useGeolocation();

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

  // Calculate nearby venues when location changes
  useEffect(() => {
    if (!location || !allVenues.length) {
      setNearbyVenueIds([]);
      return;
    }

    const venuesWithDistance = allVenues
      .filter(venue => venue.latitude && venue.longitude)
      .map(venue => ({
        ...venue,
        distance: calculateDistance(
          location.latitude,
          location.longitude,
          parseFloat(venue.latitude!),
          parseFloat(venue.longitude!)
        )
      }))
      .filter(venue => venue.distance <= 50)
      .sort((a, b) => a.distance - b.distance)
      .map(venue => venue.id);

    setNearbyVenueIds(venuesWithDistance);
  }, [location, allVenues]);

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

  // Reset pages when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setPastEventsPage(1);
    setNearbyEventsPage(1);
  }, [activeTab]);

  return {
    searchTerm,
    setSearchTerm,
    allVenues,
    filteredVenueIds,
    setFilteredVenueIds,
    nearbyVenueIds,
    userInterests,
    currentPage,
    setCurrentPage,
    pastEventsPage,
    setPastEventsPage,
    nearbyEventsPage,
    setNearbyEventsPage,
    activeTab,
    setActiveTab,
    pageSize,
    location,
    locationLoading,
    locationError,
    requestLocation
  };
};
