
import React from 'react';

interface VenueData {
  venueName: string;
  checkInCount: number;
}

interface WeeklyCheckInsTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      week: string;
      checkIns: number;
      venues: VenueData[];
    };
  }>;
  label?: string;
}

export const WeeklyCheckInsTooltip = ({ active, payload, label }: WeeklyCheckInsTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;
  
  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
      <div className="font-medium text-sm mb-2">
        Week of {label}
      </div>
      <div className="text-sm text-muted-foreground mb-2">
        Total check-ins: {data.checkIns}
      </div>
      
      {data.venues.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            Venues visited:
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {data.venues.map((venue, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="truncate max-w-[140px]" title={venue.venueName}>
                  {venue.venueName}
                </span>
                <span className="text-muted-foreground ml-2">
                  {venue.checkInCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
