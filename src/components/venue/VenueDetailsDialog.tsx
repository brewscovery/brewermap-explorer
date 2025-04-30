
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import VenueSidebar from '@/components/venue/VenueSidebar';
import { Venue } from '@/types/venue';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

interface VenueDetailsDialogProps {
  venue: Venue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VenueDetailsDialog: React.FC<VenueDetailsDialogProps> = ({
  venue,
  open,
  onOpenChange,
}) => {
  const isMobile = useIsMobile();
  
  const handleClose = () => {
    onOpenChange(false);
  };
  
  // If no venue is selected, don't render anything
  if (!venue) return null;
  
  // Use a drawer on mobile and a dialog on desktop
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[85vh]">
          <div className="h-full overflow-auto">
            <VenueSidebar venue={venue} onClose={handleClose} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] p-0 overflow-hidden">
        <div className="h-full overflow-auto">
          <VenueSidebar venue={venue} onClose={handleClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VenueDetailsDialog;
