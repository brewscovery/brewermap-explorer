
import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Drawer, 
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerDragHandle,
  DrawerHeader,
  DrawerBody,
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
import BreweryLogo from '@/components/brewery/BreweryLogo';

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
  const [position, setPosition] = useState(0.5);
  const { user, userType } = useAuth();
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isTodoListDialogOpen, setIsTodoListDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { isVenueInAnyTodoList, getTodoListForVenue } = useTodoLists();
  
  // Get todo list status for this venue if user is logged in
  const venueInTodoList = user && venue ? isVenueInAnyTodoList(venue.id) : false;
  const todoList = user && venue ? getTodoListForVenue(venue.id) : null;

  // Add a handler function to convert snapPoint to the right type for our state setter
  const handleSnapPointChange = (snapPoint: string | number) => {
    if (typeof snapPoint === 'number') {
      setPosition(snapPoint);
    } else {
      // Convert string to number if needed
      setPosition(parseFloat(snapPoint));
    }
  };

  // Handle check-in dialog
  const handleCheckInClick = (e: React.MouseEvent) => {
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

  // Handle when drawer position drops below threshold, which means user dragged down
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };
  
  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      snapPoints={[0.5, 0.95]} 
      activeSnapPoint={position}
      setActiveSnapPoint={handleSnapPointChange}
      dismissible={false} // This prevents automatic closing when clicking outside
      modal={false} // This ensures the overlay doesn't trap interactions
    >
      <DrawerContent className="h-[85vh] max-h-[85vh] fixed inset-x-0 bottom-0 z-[110] rounded-t-[10px] border bg-background p-0">
        <VisuallyHidden>
          <DrawerTitle>{venue.name} Details</DrawerTitle>
          <DrawerDescription>Information about {venue.name}</DrawerDescription>
        </VisuallyHidden>
        
        {/* Fixed header with drawer drag handle */}
        <DrawerHeader className="relative p-0">
          <DrawerDragHandle className="mb-1" />
          
          <div className="flex flex-col p-4 border-b relative">
            <div className="flex items-start gap-4">
              {/* Brewery logo on the left - matching desktop layout */}
              <div className="flex-shrink-0 flex items-center justify-center">
                <BreweryLogo 
                  logoUrl={breweryInfo?.logo_url}
                  name={breweryInfo?.name}
                  size="xlarge"
                />
              </div>
              
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1 pr-2">
                    <h2 className="text-xl font-bold truncate break-words">{venue.name}</h2>
                    {breweryInfo?.name && (
                      <p className="text-sm text-muted-foreground truncate">
                        {breweryInfo.name}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onClose}
                    className="hover:bg-gray-100 shrink-0"
                  >
                    <X size={20} />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  {breweryInfo?.is_verified && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <ShieldCheck size={14} />
                      <span>Verified</span>
                    </Badge>
                  )}
                  
                  {breweryInfo?.is_independent && (
                    <div>
                      <img 
                        src="/lovable-uploads/5aa2675a-19ef-429c-b610-584fdabf6b1b.png" 
                        alt="Certified Independent Brewery" 
                        className="h-6" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action buttons positioned at the bottom right of header */}
            <div className="flex gap-2 mt-2 justify-end">
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
        </DrawerHeader>

        {/* Scrollable body content */}
        <DrawerBody className="px-0 pt-0">
          {children}
        </DrawerBody>

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
