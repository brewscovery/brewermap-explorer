
import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BreweryLogo from '@/components/brewery/BreweryLogo';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';
import { MobileSidebarActions } from './MobileSidebarActions';

interface MobileSidebarHeaderProps {
  venue: Venue;
  breweryInfo: Brewery | null;
  onClose: () => void;
  displayMode?: 'full' | 'favorites';
  onOpenCheckInDialog: () => void;
  onOpenTodoListDialog: () => void;
}

export const MobileSidebarHeader = ({
  venue,
  breweryInfo,
  onClose,
  displayMode = 'full',
  onOpenCheckInDialog,
  onOpenTodoListDialog
}: MobileSidebarHeaderProps) => {
  return (
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
        <MobileSidebarActions
          venue={venue}
          displayMode={displayMode}
          onOpenCheckInDialog={onOpenCheckInDialog}
          onOpenTodoListDialog={onOpenTodoListDialog}
        />
      </div>
    </div>
  );
};
