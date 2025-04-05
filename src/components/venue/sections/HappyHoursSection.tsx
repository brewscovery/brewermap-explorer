
import React from 'react';
import { Beer, Clock } from 'lucide-react';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import { formatTime } from '@/utils/dateTimeUtils';
import type { VenueHappyHour } from '@/hooks/useVenueHappyHours';

interface HappyHoursSectionProps {
  happyHours: VenueHappyHour[];
  isLoading: boolean;
}

const HappyHoursSection = ({ happyHours, isLoading }: HappyHoursSectionProps) => {
  const activeHappyHours = happyHours.filter(hour => hour.is_active);
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="font-medium text-sm flex items-center gap-1.5">
          <Beer className="h-4 w-4" /> 
          Happy Hours
        </h3>
        <p className="text-sm text-muted-foreground">Loading happy hours...</p>
      </div>
    );
  }
  
  if (activeHappyHours.length === 0) {
    return null; // Don't show section if no happy hours configured
  }
  
  // Sort happy hours by day of week
  const sortedHappyHours = [...activeHappyHours].sort((a, b) => a.day_of_week - b.day_of_week);
  
  // Get today's happy hours
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const adjustedToday = today === 0 ? 6 : today - 1; // Adjust to our 0-6 format (0 = Monday)
  const todayHappyHours = sortedHappyHours.filter(hour => hour.day_of_week === adjustedToday);
  
  // Check if any happy hour is currently active
  const isHappyHourActive = () => {
    if (todayHappyHours.length === 0) return false;
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return todayHappyHours.some(hour => {
      if (!hour.start_time || !hour.end_time) return false;
      
      const start = hour.start_time.substring(0, 5);
      const end = hour.end_time.substring(0, 5);
      
      return currentTime >= start && currentTime <= end;
    });
  };
  
  const activeNow = isHappyHourActive();
  
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm flex items-center gap-1.5">
        <Beer className="h-4 w-4" /> 
        Happy Hours
        {activeNow && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full animate-pulse">
            Active now!
          </span>
        )}
      </h3>
      
      <div className="space-y-3">
        {sortedHappyHours.map((hour, index) => (
          <div key={index} className="text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">{DAYS_OF_WEEK[hour.day_of_week]}</div>
              <div className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {hour.start_time && hour.end_time ? (
                  <span>
                    {formatTime(hour.start_time)} - {formatTime(hour.end_time)}
                  </span>
                ) : (
                  <span>All day</span>
                )}
              </div>
            </div>
            
            {hour.description && (
              <p className="text-xs text-muted-foreground mt-1">{hour.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HappyHoursSection;
