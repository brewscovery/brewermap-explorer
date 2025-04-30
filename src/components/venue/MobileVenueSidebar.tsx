
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Drawer, 
  DrawerContent,
  DrawerTitle,
  DrawerDescription
} from '@/components/ui/drawer';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';
import EventsSection from './sections/EventsSection';
import { VenueFollowButton } from './VenueFollowButton';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { cn } from '@/lib/utils';
import type { VenueSidebarDisplayMode } from './VenueSidebar';
import { useAuth } from '@/contexts/AuthContext';

interface MobileVenueSidebarProps {
  venue: Venue;
  breweryInfo: Brewery | null;
  onClose: () => void;
  children: React.ReactNode;
  open: boolean;
  displayMode?: VenueSidebarDisplayMode;
  onOpenCheckInDialog?: () => void;
}

const MobileVenueSidebar = ({ 
  venue, 
  breweryInfo, 
  onClose, 
  children,
  open,
  displayMode = 'full',
  onOpenCheckInDialog
}: MobileVenueSidebarProps) => {
  const [position, setPosition] = useState(0);
  const { user, userType } = useAuth();
  
  // Create a handler function that converts string to number if needed
  const handleSnapPointChange = (snapPoint: string | number) => {
    if (typeof snapPoint === 'string') {
      setPosition(parseFloat(snapPoint));
    } else {
      setPosition(snapPoint);
    }
  };
  
  useEffect(() => {
    if (open) {
      setPosition(0); // Will snap to 50% as default position
    }
  }, [open]);

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      snapPoints={[0.5, 0.99]} 
      activeSnapPoint={position}
      setActiveSnapPoint={handleSnapPointChange}
      modal={false}
    >
      <DrawerContent className="h-[85vh] max-h-[85vh] overflow-hidden fixed inset-x-0 bottom-0 z-40 rounded-t-[10px] border bg-background">
        <VisuallyHidden>
          <DrawerTitle>{venue.name} Details</DrawerTitle>
          <DrawerDescription>Information about {venue.name}</DrawerDescription>
        </VisuallyHidden>
          
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
          
        {/* Header */}
        <div className="flex flex-col p-4 border-b relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {breweryInfo?.logo_url && (
                <div className="flex flex-col items-center gap-2">
                  <img 
                    src={breweryInfo.logo_url} 
                    alt={breweryInfo.name} 
                    className="w-12 h-12 rounded-full"
                  />
                  {breweryInfo?.is_verified ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <ShieldCheck size={14} />
                      <span>Verified</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Unverified
                    </Badge>
                  )}
                </div>
              )}
              <div className="min-w-0">
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
          <div className="absolute bottom-3 right-4 flex gap-2">
            {user && userType === 'regular' && onOpenCheckInDialog && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onOpenCheckInDialog}
                className="flex items-center gap-1"
              >
                <UserCheck size={16} />
                <span>Check In</span>
              </Button>
            )}
            {venue.id && <VenueFollowButton venueId={venue.id} />}
          </div>
        </div>

        {/* Content with Tabs */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-2 sticky top-0 bg-background z-10">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="focus:outline-none">
              {children}
            </TabsContent>
              <TabsContent value="events" className="focus:outline-none">
                <EventsSection venueId={venue.id} />
              </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileVenueSidebar;
