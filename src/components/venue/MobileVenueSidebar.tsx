
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, UserCheck, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Drawer, 
  DrawerContent,
  DrawerTitle,
  DrawerDescription
} from '@/components/ui/drawer';
import { CheckInDialog } from '@/components/CheckInDialog';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';
import EventsSection from './sections/EventsSection';
import { VenueFollowButton } from './VenueFollowButton';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { cn } from '@/lib/utils';
import type { VenueSidebarDisplayMode } from './VenueSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { TodoListDialog } from './TodoListDialog';
import { useTodoLists } from '@/hooks/useTodoLists';

interface MobileVenueSidebarProps {
  venue: Venue;
  breweryInfo: Brewery | null;
  onClose: () => void;
  children: React.ReactNode;
  open: boolean;
  displayMode?: VenueSidebarDisplayMode;
  onOpenCheckInDialog?: () => void;
  onOpenTodoListDialog?: () => void;
}

const MobileVenueSidebar = ({ 
  venue, 
  breweryInfo, 
  onClose, 
  children,
  open,
  displayMode = 'full',
  onOpenCheckInDialog,
  onOpenTodoListDialog
}: MobileVenueSidebarProps) => {
  const [position, setPosition] = useState(0);
  const { user, userType } = useAuth();
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isTodoListDialogOpen, setIsTodoListDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { isVenueInAnyTodoList, getTodoListForVenue } = useTodoLists();
  
  // Get todo list status for this venue if user is logged in
  const venueInTodoList = user && venue ? isVenueInAnyTodoList(venue.id) : false;
  const todoList = user && venue ? getTodoListForVenue(venue.id) : null;
  
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
      // Reset to default position when opening
      setPosition(0); 
      
      // Small timeout to ensure the drawer is fully rendered before any interactions
      const timer = setTimeout(() => {
        // This forces a reflow which can help with interaction issues
        const drawerContent = document.querySelector('[data-vaul-drawer-content]');
        if (drawerContent) {
          // Force a reflow without changing visual appearance
          drawerContent.getBoundingClientRect();
        }
      }, 10);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Handle check-in dialog directly in this component
  const handleCheckInClick = (e: React.MouseEvent) => {
    // Prevent event bubbling which might be interfering with the drawer
    e.stopPropagation();
    setIsCheckInDialogOpen(true);
  };

  // Handle todo list dialog 
  const handleTodoListClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTodoListDialogOpen(true);
  };

  // Handle success callback for check-in
  const handleCheckInSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['venueCheckins', venue.id] });
    queryClient.invalidateQueries({ queryKey: ['checkins', user?.id] });
    // Also invalidate todo lists to update completion status
    queryClient.invalidateQueries({ queryKey: ['todoListVenues', user?.id] });
  };

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
      dismissible={false} // Make the drawer non-dismissible to improve interaction
    >
      <DrawerContent className="h-[85vh] max-h-[85vh] overflow-hidden fixed inset-x-0 bottom-0 z-[110] rounded-t-[10px] border bg-background">
        <VisuallyHidden>
          <DrawerTitle>{venue.name} Details</DrawerTitle>
          <DrawerDescription>Information about {venue.name}</DrawerDescription>
        </VisuallyHidden>
          
        <div 
          className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted"
          // Add pointer-events-auto to ensure the handle receives interactions
          style={{ pointerEvents: 'auto' }}  
        />
          
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
                  <div className="flex flex-col gap-1 items-center">
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
                    
                    {breweryInfo?.is_independent && (
                      <div className="mt-1">
                        <img 
                          src="/lovable-uploads/5aa2675a-19ef-429c-b610-584fdabf6b1b.png" 
                          alt="Certified Independent Brewery" 
                          className="h-6" 
                        />
                      </div>
                    )}
                  </div>
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
          {user && userType === 'regular' && (
              <>
                {displayMode === 'full' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleCheckInClick}
                    className="flex items-center gap-1"
                  >
                    <UserCheck size={16} />
                    <span>Check In</span>
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant={venueInTodoList ? "secondary" : "outline"}
                  onClick={handleTodoListClick}
                  className="flex items-center gap-1"
                  title={venueInTodoList ? `In "${todoList?.name}" list` : "Add to ToDo List"}
                >
                  <ListTodo size={16} />
                </Button>
              </>
            )}
            {venue.id && <VenueFollowButton venueId={venue.id} />}
          </div>
        </div>

        {/* Content with Tabs - The fix is here: We directly use the Tabs from the parent */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Add CheckInDialog component to handle check-in functionality */}
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
      </DrawerContent>
    </Drawer>
  );
};
export default MobileVenueSidebar;
