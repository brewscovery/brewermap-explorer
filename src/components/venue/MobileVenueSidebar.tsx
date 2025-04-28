
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Drawer, 
  DrawerPortal,
  DrawerTitle,
  DrawerContent
} from '@/components/ui/drawer';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';
import EventsSection from './sections/EventsSection';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { cn } from '@/lib/utils';

interface MobileVenueSidebarProps {
  venue: Venue;
  breweryInfo: Brewery | null;
  onClose: () => void;
  children: React.ReactNode;
  open: boolean;
}

// Custom DrawerContent that doesn't use DrawerOverlay
const CustomDrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerContent>,
  React.ComponentPropsWithoutRef<typeof DrawerContent>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerContent
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerContent>
  </DrawerPortal>
));
CustomDrawerContent.displayName = "CustomDrawerContent";

const MobileVenueSidebar = ({ 
  venue, 
  breweryInfo, 
  onClose, 
  children,
  open 
}: MobileVenueSidebarProps) => {
  const snapPoints = [0.5, 0.99];
  const [position, setPosition] = useState(0);
  
  useEffect(() => {
    if (open) {
      setPosition(0); // Will snap to 50% as it's the first snap point
    }
  }, [open]);

  // Create a handler function that properly converts the snap point value to number
  const handleSnapPointChange = (snapPoint: string | number) => {
    setPosition(typeof snapPoint === 'string' ? parseFloat(snapPoint) : snapPoint);
  };

  return (
    <Drawer
      direction="bottom"
      open={open}
      onClose={onClose}
      snapPoints={snapPoints}
      activeSnapPoint={position}
      setActiveSnapPoint={handleSnapPointChange}
      shouldScaleBackground={false}
    >
      <CustomDrawerContent 
        className="
          flex flex-col 
          h-[85vh] 
          max-h-[85vh] 
          overflow-hidden 
          fixed 
          inset-x-0 
          bottom-0 
          z-40 
          mt-24 
          rounded-t-[10px] 
          border 
          bg-background
          pointer-events-auto
        "
      >
        <VisuallyHidden>
          <DrawerTitle>{venue.name} Details</DrawerTitle>
        </VisuallyHidden>
        
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
      </CustomDrawerContent>
    </Drawer>
  );
};

export default MobileVenueSidebar;
