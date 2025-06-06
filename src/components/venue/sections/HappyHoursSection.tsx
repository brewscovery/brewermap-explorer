
import React, { useState } from 'react';
import { Beer, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import { formatTime, getTodayDayOfWeek } from '@/utils/dateTimeUtils';
import type { VenueHappyHour } from '@/hooks/useVenueHappyHours';
import LastUpdatedInfo from './LastUpdatedInfo';

interface HappyHoursSectionProps {
  happyHours: VenueHappyHour[];
  isLoading: boolean;
}

const HappyHoursSection = ({ happyHours, isLoading }: HappyHoursSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const activeHappyHours = happyHours.filter(hour => hour.is_active);
  
  // Get the most recent update time and who updated it
  const getLastUpdatedInfo = () => {
    if (happyHours.length === 0) return { updatedAt: null, updatedByType: null };
    
    // Find the most recently updated happy hour
    const mostRecent = happyHours.reduce(
      (latest, current) => {
        if (!latest.updated_at) return current;
        if (!current.updated_at) return latest;
        
        return new Date(current.updated_at) > new Date(latest.updated_at) 
          ? current 
          : latest;
      }, 
      { updated_at: null } as any
    );
    
    return {
      updatedAt: mostRecent.updated_at,
      updatedByType: mostRecent.updated_by ? 'admin' : 'business'
    };
  };
  
  const { updatedAt, updatedByType } = getLastUpdatedInfo();
  
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
  const todayIndex = getTodayDayOfWeek(); // Using the consistent function
  const todayHappyHours = sortedHappyHours.filter(hour => hour.day_of_week === todayIndex);
  
  // Check if any happy hour is currently active
  const isHappyHourActive = () => {
    if (todayHappyHours.length === 0) return false;
    
    const now = new Date();
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return todayHappyHours.some(hour => {
      if (!hour.start_time || !hour.end_time) return false;
      
      const start = hour.start_time.substring(0, 5);
      const end = hour.end_time.substring(0, 5);
      
      return currentTime >= start && currentTime <= end;
    });
  };
  
  const activeNow = isHappyHourActive();
  
  // Show today's happy hours summary when collapsed
  const todaySummary = todayHappyHours.length > 0 ? (
    <div className="text-sm">
      <div className="flex items-center justify-between">
        <div className="font-medium">Today</div>
        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          {todayHappyHours.length === 1 && todayHappyHours[0].start_time && todayHappyHours[0].end_time ? (
            <span>
              {formatTime(todayHappyHours[0].start_time)} - {formatTime(todayHappyHours[0].end_time)}
            </span>
          ) : (
            <span>{todayHappyHours.length} happy hour{todayHappyHours.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
      {todayHappyHours.length === 1 && todayHappyHours[0].description && (
        <p className="text-xs text-muted-foreground mt-1">{todayHappyHours[0].description}</p>
      )}
    </div>
  ) : (
    <div className="text-sm text-muted-foreground">No happy hours today</div>
  );
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="font-medium text-sm flex items-center gap-1.5">
            <Beer className="h-4 w-4" /> 
            Happy Hours
            {activeNow && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full animate-pulse">
                Active now!
              </span>
            )}
          </h3>
          <LastUpdatedInfo updatedAt={updatedAt} updatedByType={updatedByType} />
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
          className="h-6 px-1"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>
      
      {/* Today's summary when collapsed */}
      {!expanded && todaySummary}
      
      {/* Expanded view */}
      {expanded && (
        <div className="space-y-3 pt-2">
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
      )}
    </div>
  );
};

export default HappyHoursSection;
