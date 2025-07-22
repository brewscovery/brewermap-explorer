
import React, { useState } from 'react';
import { 
  Drawer, 
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerDragHandle,
  DrawerHeader,
  DrawerBody,
} from '@/components/ui/drawer';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useTodoLists } from '@/hooks/useTodoLists';
import { MobileSidebarHeader } from './mobile/MobileSidebarHeader';
import { MobileSidebarDialogs } from './mobile/MobileSidebarDialogs';

interface MobileVenueSidebarProps {
  venue: Venue;
  breweryInfo: Brewery | null;
  onClose: () => void;
  children: React.ReactNode;
  open: boolean;
  displayMode?: 'full' | 'favorites';
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
  const { user } = useAuth();
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isTodoListDialogOpen, setIsTodoListDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Handle snap point change
  const handleSnapPointChange = (snapPoint: string | number) => {
    if (typeof snapPoint === 'number') {
      setPosition(snapPoint);
    } else {
      setPosition(parseFloat(snapPoint));
    }
  };

  // Handle check-in dialog - fixed to no longer require event parameter
  const handleCheckInClick = () => {
    setIsCheckInDialogOpen(true);
  };

  // Handle todo list dialog - fixed to no longer require event parameter
  const handleTodoListClick = () => {
    setIsTodoListDialogOpen(true);
  };

  // Handle success callback for check-in
  const handleCheckInSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['venueCheckins', venue.id] });
    queryClient.invalidateQueries({ queryKey: ['checkins', user?.id] });
    // Also invalidate todo lists to update completion status
    queryClient.invalidateQueries({ queryKey: ['todoListVenues', user?.id] });
  };

  // Handle drawer position change
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };
  
  return (
    <>
      <Drawer
        open={open}
        onOpenChange={handleOpenChange}
        snapPoints={[0.5, 0.95]} 
        activeSnapPoint={position}
        setActiveSnapPoint={handleSnapPointChange}
        dismissible={false}
        modal={false}
      >
        <DrawerContent className="h-[85vh] max-h-[85vh] fixed inset-x-0 bottom-0 z-[120] rounded-t-[10px] border bg-background p-0">
          <VisuallyHidden>
            <DrawerTitle>{venue.name} Details</DrawerTitle>
            <DrawerDescription>Information about {venue.name}</DrawerDescription>
          </VisuallyHidden>
          
          {/* Fixed header with drawer drag handle */}
          <DrawerHeader className="relative p-0 z-[125]">
            <DrawerDragHandle className="mb-1" />
            
            <MobileSidebarHeader
              venue={venue}
              breweryInfo={breweryInfo}
              onClose={onClose}
              displayMode={displayMode}
              onOpenCheckInDialog={handleCheckInClick}
              onOpenTodoListDialog={handleTodoListClick}
            />
          </DrawerHeader>

          {/* Scrollable body content with higher z-index for dropdowns */}
          <DrawerBody className="px-0 pt-0 z-[125] relative">
            <div className="relative z-[130]">
              {children}
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Check-in and Todo list dialogs - moved outside the Drawer component for proper stacking */}
      <MobileSidebarDialogs
        venue={venue}
        user={user}
        isCheckInDialogOpen={isCheckInDialogOpen}
        isTodoListDialogOpen={isTodoListDialogOpen}
        onCheckInDialogClose={() => setIsCheckInDialogOpen(false)}
        onTodoListDialogClose={() => setIsTodoListDialogOpen(false)}
        onCheckInSuccess={handleCheckInSuccess}
      />
    </>
  );
};

export default MobileVenueSidebar;
