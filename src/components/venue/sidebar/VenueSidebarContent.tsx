
import React from 'react';
import { Navigation } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';
import AboutSection from '../sections/AboutSection';
import AddressSection from '../sections/AddressSection';
import ContactSection from '../sections/ContactSection';
import VenueHoursSection from '../sections/VenueHoursSection';
import HappyHoursSection from '../sections/HappyHoursSection';
import DailySpecialsSection from '../sections/DailySpecialsSection';
import CheckInsSection from '../sections/CheckInsSection';
import EventsSection from '../sections/EventsSection';
import { useAuth } from '@/contexts/AuthContext';

interface VenueSidebarContentProps {
  venue: Venue;
  breweryInfo: Brewery | null;
  venueHours: any[];
  happyHours: any[];
  dailySpecials: any[];
  checkins: any[];
  isLoadingHours: boolean;
  isLoadingHappyHours: boolean;
  isLoadingDailySpecials: boolean;
  displayMode: 'full' | 'favorites';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCheckInDialog: () => void;
}

const VenueSidebarContent = ({
  venue,
  breweryInfo,
  venueHours,
  happyHours,
  dailySpecials,
  checkins,
  isLoadingHours,
  isLoadingHappyHours,
  isLoadingDailySpecials,
  displayMode,
  activeTab,
  setActiveTab,
  onOpenCheckInDialog
}: VenueSidebarContentProps) => {
  const { user, userType } = useAuth();
  const hasCoordinates = venue?.latitude && venue?.longitude;
  
  const handleGetDirections = () => {
    if (!hasCoordinates) return;
    const lat = venue.latitude;
    const lng = venue.longitude;
    const title = encodeURIComponent(venue.name);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    let url = '';
    if (isIOS) {
      url = `maps://?daddr=${lat},${lng}&q=${title}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`;
    }
    window.open(url, '_blank', 'noopener');
  };

  const overviewContent = (
    <div className="space-y-5 p-4">
      {/* Always show About section if in full mode */}
      {displayMode === 'full' && (
        <AboutSection breweryInfo={breweryInfo} />
      )}
      
      {/* Always show Address section regardless of display mode */}
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
      
      {/* Always show Contact section regardless of display mode */}
      <ContactSection venue={venue} breweryInfo={breweryInfo} />
      
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
            onOpenCheckInDialog={onOpenCheckInDialog}
            showCheckInButton={false} // Hide the button in the CheckInsSection since we moved it to the header
          />
        </>
      )}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 sticky top-0 bg-background z-10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="focus:outline-none">
          {overviewContent}
        </TabsContent>
        <TabsContent value="events" className="focus:outline-none p-4">
          <EventsSection venueId={venue.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VenueSidebarContent;
