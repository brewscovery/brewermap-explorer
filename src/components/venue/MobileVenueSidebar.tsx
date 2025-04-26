
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Drawer, 
  DrawerContent, 
  DrawerOverlay,
  DrawerPortal 
} from '@/components/ui/drawer';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';
import EventsSection from './sections/EventsSection';

interface MobileVenueSidebarProps {
  venue: Venue;
  breweryInfo: Brewery | null;
  onClose: () => void;
  children: React.ReactNode;
  open: boolean;
}

const MobileVenueSidebar = ({ 
  venue, 
  breweryInfo, 
  onClose, 
  children,
  open 
}: MobileVenueSidebarProps) => {
  const snapPoints = [0.25, 0.5, 0.85];
  const [activeSnapPoint, setActiveSnapPoint] = useState(0);
  
  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      snapPoints={snapPoints}
      modal={false}
      shouldScaleBackground={false}
      dismissible
    >
      <DrawerOverlay 
        className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 pointer-events-none" 
      />
      <DrawerContent 
        className="
          flex flex-col 
          h-[85vh] 
          max-h-[85vh] 
          overflow-hidden 
          fixed 
          inset-x-0 
          bottom-0 
          z-50 
          mt-24 
          rounded-t-[10px] 
          border 
          bg-background
          transition-transform 
          duration-300 
          ease-in-out
          will-change-transform
        "
        style={{
          transform: "translate3d(0, 0, 0)"
        }}
      >
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        
        {/* Header */}
        <div className="flex flex-col p-4 border-b">
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
