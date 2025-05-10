
import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BreweryLogo from '@/components/brewery/BreweryLogo';
import type { Brewery } from '@/types/brewery';

interface VenueSidebarHeaderProps {
  venueName: string;
  breweryInfo: Brewery | null;
  onClose: () => void;
}

const VenueSidebarHeader = ({ venueName, breweryInfo, onClose }: VenueSidebarHeaderProps) => {
  return (
    <div className="flex flex-col p-6 border-b relative">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-2">
            <BreweryLogo 
              logoUrl={breweryInfo?.logo_url}
              name={breweryInfo?.name}
              size="medium"
            />
            <div className="flex flex-col gap-1 items-center">
              {breweryInfo?.is_verified ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ShieldCheck size={14} />
                  <span>Verified Brewery</span>
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
                    className="h-8" 
                  />
                </div>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">{venueName}</h2>
            {breweryInfo?.name && (
              <p className="text-sm text-muted-foreground truncate">
                {breweryInfo.name}
              </p>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="hover:bg-gray-100"
        >
          <X size={20} />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </div>
  );
};

export default VenueSidebarHeader;
