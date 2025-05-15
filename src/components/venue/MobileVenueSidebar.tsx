
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
      closeThreshold={0.2} // This enables drag-to-close functionality - when dragged below 20% of screen height it will close
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
