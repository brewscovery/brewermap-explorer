
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Venue } from "@/types/venue";

export const useEventsExplorer = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [filteredVenueIds, setFilteredVenueIds] = useState<string[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pastEventsPage, setPastEventsPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  const pageSize = 10;

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
  }, [activeTab]);

  return {
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
  };
};
