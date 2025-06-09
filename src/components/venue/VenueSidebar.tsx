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
  
  const venueId = venue?.id || null;
  
  console.log(`VenueSidebar rendering with venue ID: ${venueId}`);
  
  // Use consolidated real-time updates for this venue
  useRealtimeVenue(venueId);
  
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
      
      let query = supabase
        .from('checkins')
        .select(`
          id, rating, comment, visited_at, created_at, user_id,
          profiles!inner(first_name, last_name)
        `)
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false });
      
      if (user) {
        const { data: userCheckins, error: userCheckinsError } = await query
          .eq('user_id', user.id);
          
        if (userCheckinsError) throw userCheckinsError;
        
        const { data: otherCheckins, error: otherCheckinsError } = await supabase
          .from('checkins')
          .select(`
            id, rating, comment, visited_at, created_at, user_id,
            profiles!inner(first_name, last_name)
          `)
          .eq('venue_id', venueId)
          .neq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (otherCheckinsError) throw otherCheckinsError;
        
        return [...(userCheckins || []), ...(otherCheckins || [])].map(item => ({
          ...item,
          first_name: item.profiles?.first_name || null,
          last_name: item.profiles?.last_name || null
        }));
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        first_name: item.profiles?.first_name || null,
        last_name: item.profiles?.last_name || null
      }));
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
    if (onClose) {
      onClose();
    }
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
    <div className="fixed left-0 top-[73px] z-[30] flex h-[calc(100vh-73px)] w-full max-w-md flex-col bg-white shadow-lg animate-slide-in-left">
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
