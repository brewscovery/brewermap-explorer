
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Info } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface LastUpdatedInfoProps {
  updatedAt: string | null;
  updatedByType?: string | null;
  className?: string;
}

const LastUpdatedInfo = ({ updatedAt, updatedByType = null, className = '' }: LastUpdatedInfoProps) => {
  if (!updatedAt) return null;
  
  const formattedDate = new Date(updatedAt).toLocaleDateString();
  const timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });
  const updaterType = updatedByType || 'business';
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className={`flex items-center text-xs text-muted-foreground ${className}`}>
            <Info className="h-3 w-3 mr-1" />
            <span>Updated {timeAgo}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Last updated on {formattedDate} by {updaterType}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LastUpdatedInfo;
