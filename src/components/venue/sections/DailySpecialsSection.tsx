
import React from 'react';
import { MenuSquare, Clock } from 'lucide-react';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import { formatTime, getTodayDayOfWeek } from '@/utils/dateTimeUtils';
import type { VenueDailySpecial } from '@/hooks/useVenueDailySpecials';
import LastUpdatedInfo from './LastUpdatedInfo';

interface DailySpecialsSectionProps {
  dailySpecials: VenueDailySpecial[];
  isLoading: boolean;
}

const DailySpecialsSection = ({ dailySpecials, isLoading }: DailySpecialsSectionProps) => {
  const activeSpecials = dailySpecials.filter(special => special.is_active);
  
  // Get the most recent update time and who updated it
  const getLastUpdatedInfo = () => {
    if (dailySpecials.length === 0) return { updatedAt: null, updatedByType: null };
    
    // Find the most recently updated special
    const mostRecent = dailySpecials.reduce(
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
          <MenuSquare className="h-4 w-4" /> 
          Daily Specials
        </h3>
        <p className="text-sm text-muted-foreground">Loading daily specials...</p>
      </div>
    );
  }
  
  if (activeSpecials.length === 0) {
    return null; // Don't show section if no specials configured
  }
  
  // Sort specials by day of week
  const sortedSpecials = [...activeSpecials].sort((a, b) => a.day_of_week - b.day_of_week);
  
  // Get today's specials
  const todayIndex = getTodayDayOfWeek();
  const todaySpecials = sortedSpecials.filter(special => special.day_of_week === todayIndex);
  
  // Check if any special is currently active
  const isSpecialActive = () => {
    if (todaySpecials.length === 0) return false;
    
    const now = new Date();
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    return todaySpecials.some(special => {
      if (!special.start_time || !special.end_time) return false;
      
      const start = special.start_time.substring(0, 5);
      const end = special.end_time.substring(0, 5);
      
      return currentTime >= start && currentTime <= end;
    });
  };
  
  const activeNow = isSpecialActive();
  
  return (
    <div className="space-y-2">
      <div className="flex flex-col">
        <h3 className="font-medium text-sm flex items-center gap-1.5">
          <MenuSquare className="h-4 w-4" /> 
          Daily Specials
          {activeNow && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full animate-pulse">
              Available now!
            </span>
          )}
        </h3>
        <LastUpdatedInfo updatedAt={updatedAt} updatedByType={updatedByType} />
      </div>
      
      <div className="space-y-3">
        {sortedSpecials.map((special, index) => (
          <div key={index} className="text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">{DAYS_OF_WEEK[special.day_of_week]}</div>
              <div className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {special.start_time && special.end_time ? (
                  <span>
                    {formatTime(special.start_time)} - {formatTime(special.end_time)}
                  </span>
                ) : (
                  <span>All day</span>
                )}
              </div>
            </div>
            
            {special.description && (
              <p className="text-xs text-muted-foreground mt-1">{special.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailySpecialsSection;
