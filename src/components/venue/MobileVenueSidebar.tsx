
import React from 'react';
import { Sheet, SheetContent } from 'vaul';
import { useIsMobile } from '@/hooks/use-mobile';
import { X, ShieldCheck, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';

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
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="bottom"
        className="fixed inset-x-0 bottom-0 mt-24 h-[85vh] rounded-t-[10px]"
        snapPoints={[0.25, 0.5, 0.85]}
        initial={0.25}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Drag handle */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-4" />
          
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileVenueSidebar;
