import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Venue } from '@/types/venue';
import { useVenueHours } from '@/hooks/useVenueHours';
import { useVenueHappyHours } from '@/hooks/useVenueHappyHours';
import { useVenueDailySpecials } from '@/hooks/useVenueDailySpecials';
import { useRealtimeVenue } from '@/hooks/useRealtimeVenue';
import { useIsMobile } from '@/hooks/use-mobile';
import { CheckInDialog } from '@/components/CheckInDialog';
import { TodoListDialog } from './TodoListDialog';
import MobileVenueSidebar from './MobileVenueSidebar';
import type { Brewery } from '@/types/brewery';

// Import the new component pieces
import { 
  VenueSidebarHeader,
  VenueSidebarContent
} from './sidebar';

export type VenueSidebarDisplayMode = 'full' | 'favorites';

interface VenueSidebarProps {
  venue: Venue | null;
  onClose: () => void;
  displayMode?: VenueSidebarDisplayMode;
}

const VenueSidebar = ({ venue, onClose, displayMode = 'full' }: VenueSidebarProps) => {
  const { user, userType } = useAuth();
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isTodoListDialogOpen, setIsTodoListDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isVisible, setIsVisible] = useState(true);
  
  const venueId = venue?.id || null;

  // Use consolidated real-time updates for this venue
  useRealtimeVenue(venueId);
  
  console.log(`VenueSidebar rendering with venue ID: ${venueId}`);
  
  const { hours: venueHours = [], isLoading: isLoadingHours } = useVenueHours(venueId);
  const { happyHours = [], isLoading: isLoadingHappyHours } = useVenueHappyHours(venueId);
  const { dailySpecials = [], isLoading: isLoadingDailySpecials } = useVenueDailySpecials(venueId);
  
  if (venueHours.length > 0) {
    console.log(`[DEBUG] VenueSidebar received hours data:`, venueHours);
  }
  
  const { data: breweryInfo } = useQuery({
    queryKey: ['brewery', venue?.brewery_id],
    queryFn: async () => {
      if (!venue?.brewery_id) return null;
      
      const { data, error } = await supabase
        .from('breweries')
        .select('id, name, about, website_url, facebook_url, instagram_url, logo_url, is_verified, is_independent, country')
        .eq('id', venue.brewery_id)
        .single();
      
      if (error) throw error;
      return data as Brewery;
    },
    enabled: !!venue?.brewery_id
  });
  
  const { data: checkins = [] } = useQuery({
    queryKey: ['venueCheckins', venueId],
    queryFn: async () => {
      if (!venueId) return [];
      if (!user) return []; // Only fetch if user is logged in
      
      // First, get checkins for this venue
      const { data: checkinsData, error: checkinsError } = await supabase
        .from('checkins')
        .select('id, rating, comment, visited_at, created_at, user_id')
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false });
      
      if (checkinsError) throw checkinsError;
      
      if (!checkinsData || checkinsData.length === 0) {
        return [];
      }
      
      // Get unique user IDs from the checkins
      const userIds = [...new Set(checkinsData.map(checkin => checkin.user_id).filter(Boolean))];
      
      // Fetch profile data for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Create a map of user profiles for quick lookup
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      );
      
      // Combine checkins with profile data and prioritize user's own checkins
      const userCheckins = checkinsData
        .filter(checkin => checkin.user_id === user.id)
        .map(checkin => ({
          ...checkin,
          first_name: profilesMap.get(checkin.user_id)?.first_name || null,
          last_name: profilesMap.get(checkin.user_id)?.last_name || null
        }));
      
      const otherCheckins = checkinsData
        .filter(checkin => checkin.user_id !== user.id)
        .map(checkin => ({
          ...checkin,
          first_name: profilesMap.get(checkin.user_id)?.first_name || null,
          last_name: profilesMap.get(checkin.user_id)?.last_name || null
        }));
      
      return [...userCheckins, ...otherCheckins];
    },
    enabled: !!venueId && !!user
  });

  const handleCheckInSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['venueCheckins', venueId] });
    queryClient.invalidateQueries({ queryKey: ['checkins', user?.id] });
    // Also invalidate todo lists to update completion status
    queryClient.invalidateQueries({ queryKey: ['todoListVenues', user?.id] });
  };

  const handleOpenCheckInDialog = () => {
    setIsCheckInDialogOpen(true);
  };

  const handleOpenTodoListDialog = () => {
    setIsTodoListDialogOpen(true);
  };

  const handleClose = () => {
    console.log("VenueSidebar: handleClose called explicitly");
    setIsVisible(false);
    // Add a small delay to allow slide-out animation before actually closing
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300); // Match the animation duration
  };

  const isMobile = useIsMobile();

  if (!venue) return null;

  // Check if we should show mobile view
  if (isMobile) {
    return (
      <MobileVenueSidebar
        venue={venue}
        breweryInfo={breweryInfo}
        onClose={handleClose}
        open={true}
        displayMode={displayMode}
        onOpenCheckInDialog={handleOpenCheckInDialog}
        onOpenTodoListDialog={handleOpenTodoListDialog}
      >
        <VenueSidebarContent
          venue={venue}
          breweryInfo={breweryInfo}
          venueHours={venueHours}
          happyHours={happyHours}
          dailySpecials={dailySpecials}
          checkins={checkins}
          isLoadingHours={isLoadingHours}
          isLoadingHappyHours={isLoadingHappyHours}
          isLoadingDailySpecials={isLoadingDailySpecials}
          displayMode={displayMode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCheckInDialog={handleOpenCheckInDialog}
        />
      </MobileVenueSidebar>
    );
  }

  return (
    <div className={`fixed left-0 top-[73px] z-[30] flex h-[calc(100vh-73px)] w-full max-w-md flex-col bg-white shadow-lg transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <VenueSidebarHeader 
        venue={venue}
        venueName={venue.name}
        breweryInfo={breweryInfo}
        onClose={handleClose}
        displayMode={displayMode}
        onOpenCheckInDialog={handleOpenCheckInDialog}
        onOpenTodoListDialog={handleOpenTodoListDialog}
      />
      
      <VenueSidebarContent
        venue={venue}
        breweryInfo={breweryInfo}
        venueHours={venueHours}
        happyHours={happyHours}
        dailySpecials={dailySpecials}
        checkins={checkins}
        isLoadingHours={isLoadingHours}
        isLoadingHappyHours={isLoadingHappyHours}
        isLoadingDailySpecials={isLoadingDailySpecials}
        displayMode={displayMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCheckInDialog={handleOpenCheckInDialog}
      />

      {venue && user && (
        <>
          <CheckInDialog
            venue={venue}
            isOpen={isCheckInDialogOpen}
            onClose={() => setIsCheckInDialogOpen(false)}
            onSuccess={handleCheckInSuccess}
          />
          <TodoListDialog
            venue={venue}
            isOpen={isTodoListDialogOpen}
            onClose={() => setIsTodoListDialogOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default VenueSidebar;
