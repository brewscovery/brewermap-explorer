import React, { useState } from 'react';
import { X, ShieldCheck, Navigation, UserCheck, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckInDialog } from '@/components/CheckInDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Venue } from '@/types/venue';
import { useVenueHours } from '@/hooks/useVenueHours';
import { useVenueHappyHours } from '@/hooks/useVenueHappyHours';
import { useVenueDailySpecials } from '@/hooks/useVenueDailySpecials';
import { useIsMobile } from '@/hooks/use-mobile';
import BreweryLogo from '@/components/brewery/BreweryLogo';
import MobileVenueSidebar from './MobileVenueSidebar';
import AboutSection from './sections/AboutSection';
import AddressSection from './sections/AddressSection';
import ContactSection from './sections/ContactSection';
import VenueHoursSection from './sections/VenueHoursSection';
import HappyHoursSection from './sections/HappyHoursSection';
import DailySpecialsSection from './sections/DailySpecialsSection';
import CheckInsSection from './sections/CheckInsSection';
import EventsSection from './sections/EventsSection';
import { VenueFollowButton } from './VenueFollowButton';
import type { Brewery } from '@/types/brewery';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TodoListDialog } from './TodoListDialog';
import { useTodoLists } from '@/hooks/useTodoLists';

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
  
  const { isVenueInAnyTodoList, getTodoListForVenue } = useTodoLists();
  
  const venueId = venue?.id || null;
  
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
        .select('id, name, about, website_url, facebook_url, instagram_url, logo_url, is_verified, is_independent')
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

  const hasCoordinates = venue?.latitude && venue?.longitude;
  const handleGetDirections = () => {
    if (!hasCoordinates) return;
    const lat = venue!.latitude;
    const lng = venue!.longitude;
    const title = encodeURIComponent(venue!.name);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    let url = '';
    if (isIOS) {
      url = `maps://?daddr=${lat},${lng}&q=${title}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`;
    }
    window.open(url, '_blank', 'noopener');
  };

  const isMobile = useIsMobile();
  
  if (!venue) return null;

  // Get todo list status for this venue if user is logged in
  const venueInTodoList = user && venue ? isVenueInAnyTodoList(venue.id) : false;
  const todoList = user && venue ? getTodoListForVenue(venue.id) : null;

  // Create content based on display mode
  const overviewContent = (
    <div className="space-y-5 p-4 text-left">
      {displayMode === 'full' && (
        <>
          <AboutSection breweryInfo={breweryInfo} />
          <div className="space-y-1">
            <AddressSection venue={venue} />
            {hasCoordinates && (
              <Button
                onClick={handleGetDirections}
                variant="secondary"
                size="sm"
                className="mt-2"
              >
                <Navigation size={16} className="mr-1" />
                Get Directions
              </Button>
            )}
          </div>
          <ContactSection venue={venue} breweryInfo={breweryInfo} />
        </>
      )}
      
      <VenueHoursSection venueHours={venueHours} isLoadingHours={isLoadingHours} />
      <HappyHoursSection happyHours={happyHours} isLoading={isLoadingHappyHours} />
      <DailySpecialsSection dailySpecials={dailySpecials} isLoading={isLoadingDailySpecials} />
      
      {displayMode === 'full' && (
        <>
          <Separator className="my-5" />
          
          <CheckInsSection 
            venue={venue}
            checkins={checkins}
            user={user}
            userType={userType}
            onOpenCheckInDialog={handleOpenCheckInDialog}
            showCheckInButton={false} // Hide the button in the CheckInsSection since we moved it to the header
          />
        </>
      )}
    </div>
  );

  // Check if we should show mobile view after defining overviewContent
  if (isMobile) {
    return (
      <MobileVenueSidebar
        venue={venue}
        breweryInfo={breweryInfo}
        onClose={onClose}
        open={true}
        displayMode={displayMode}
        onOpenCheckInDialog={user && userType === 'regular' ? handleOpenCheckInDialog : undefined}
        onOpenTodoListDialog={user && userType === 'regular' ? handleOpenTodoListDialog : undefined}
      >
        {overviewContent}
      </MobileVenueSidebar>
    );
  }

  return (
    <div className="fixed left-0 top-[73px] z-30 flex h-[calc(100vh-73px)] w-full max-w-md flex-col bg-white shadow-lg animate-slide-in-left">
      <div className="flex flex-col p-6 border-b relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-2">
              <BreweryLogo 
                logoUrl={breweryInfo?.logo_url}
                name={breweryInfo?.name}
                size="medium"
              />
              <div className="flex flex-col gap-1 items-center">
                {breweryInfo?.is_verified ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <ShieldCheck size={14} />
                    <span>Verified Brewery</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Unverified
                  </Badge>
                )}
                
                {breweryInfo?.is_independent && (
                  <div className="mt-1">
                    <img 
                      src="/lovable-uploads/5aa2675a-19ef-429c-b610-584fdabf6b1b.png" 
                      alt="Certified Independent Brewery" 
                      className="h-8" 
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0 text-left">
              <h2 className="text-xl font-bold truncate">{venue.name}</h2>
              {breweryInfo?.name && (
                <p className="text-sm text-muted-foreground truncate">
                  {breweryInfo.name}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        {/* Action buttons positioned at the bottom right of header */}
        <div className="absolute bottom-4 right-6 flex gap-2">
          {user && userType === 'regular' && (
            <>
              {displayMode === 'full' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleOpenCheckInDialog}
                  className="flex items-center gap-1"
                >
                  <UserCheck size={16} />
                  <span>Check In</span>
                </Button>
              )}
              <Button 
                size="sm" 
                variant={venueInTodoList ? "secondary" : "outline"}
                onClick={handleOpenTodoListDialog}
                className="flex items-center gap-1"
                title={venueInTodoList ? `In "${todoList?.name}" list` : "Add to ToDo List"}
              >
                <ListTodo size={16} />
                <span>{venueInTodoList ? "In ToDo" : "ToDo"}</span>
              </Button>
            </>
          )}
          {venue.id && <VenueFollowButton venueId={venue.id} />}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 sticky top-0 bg-background z-10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="focus:outline-none">
            {overviewContent}
          </TabsContent>
            <TabsContent value="events" className="focus:outline-none p-4 text-left">
              <EventsSection venueId={venue.id} />
            </TabsContent>
        </Tabs>
      </div>

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
