
import React from 'react';
import { BellOff, Clock, Utensils } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { VenueHour } from '@/types/venueHours';

interface VenueHoursDayItemProps {
  day: string;
  dayIndex: number;
  dayData: Partial<VenueHour>;
  hasKitchen: boolean;
  kitchenClosedDays: Set<number>;
  HOURS: { value: string; label: string; }[];
  onClosedToggle: (dayIndex: number, value: boolean) => void;
  onTimeChange: (dayIndex: number, field: string, value: string) => void;
  onKitchenClosedToggle: (dayIndex: number, isClosed: boolean) => void;
}

const VenueHoursDayItem = ({
  day,
  dayIndex,
  dayData,
  hasKitchen,
  kitchenClosedDays,
  HOURS,
  onClosedToggle,
  onTimeChange,
  onKitchenClosedToggle
}: VenueHoursDayItemProps) => {
  return (
    <div className={`grid grid-cols-[130px_1fr] gap-4 ${dayData.is_closed ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{day}</span>
        <Switch 
          id={`closed-${dayIndex}`} 
          checked={!dayData.is_closed}
          onCheckedChange={(checked) => onClosedToggle(dayIndex, !checked)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor={`venue-open-${dayIndex}`} className="text-xs">Open</Label>
              <Select
                value={dayData.venue_open_time || ''}
                onValueChange={(value) => onTimeChange(dayIndex, 'venue_open_time', value)}
                disabled={dayData.is_closed}
              >
                <SelectTrigger id={`venue-open-${dayIndex}`}>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]" onWheel={(e) => e.stopPropagation()}>
                    {HOURS.map((hour) => (
                      <SelectItem key={hour.value} value={hour.value}>
                        {hour.label}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor={`venue-close-${dayIndex}`} className="text-xs">Close</Label>
              <Select
                value={dayData.venue_close_time || ''}
                onValueChange={(value) => onTimeChange(dayIndex, 'venue_close_time', value)}
                disabled={dayData.is_closed}
              >
                <SelectTrigger id={`venue-close-${dayIndex}`}>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]" onWheel={(e) => e.stopPropagation()}>
                    {HOURS.map((hour) => (
                      <SelectItem key={hour.value} value={hour.value}>
                        {hour.label}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {hasKitchen && (
          <div className="space-y-3">
            {!dayData.is_closed && (
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BellOff className="h-3 w-3" />
                  <span>Kitchen closed this day</span>
                </div>
                <Switch 
                  id={`kitchen-closed-${dayIndex}`} 
                  checked={kitchenClosedDays.has(dayIndex)}
                  onCheckedChange={(checked) => onKitchenClosedToggle(dayIndex, checked)}
                  disabled={dayData.is_closed}
                />
              </div>
            )}
            
            <div className={`flex gap-2 items-end ${kitchenClosedDays.has(dayIndex) ? 'opacity-50' : ''}`}>
              <div className="flex-1">
                <Label htmlFor={`kitchen-open-${dayIndex}`} className="text-xs">Open</Label>
                <Select
                  value={dayData.kitchen_open_time || ''}
                  onValueChange={(value) => onTimeChange(dayIndex, 'kitchen_open_time', value)}
                  disabled={dayData.is_closed || kitchenClosedDays.has(dayIndex)}
                >
                  <SelectTrigger id={`kitchen-open-${dayIndex}`}>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]" onWheel={(e) => e.stopPropagation()}>
                      {HOURS.map((hour) => (
                        <SelectItem key={hour.value} value={hour.value}>
                          {hour.label}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor={`kitchen-close-${dayIndex}`} className="text-xs">Close</Label>
                <Select
                  value={dayData.kitchen_close_time || ''}
                  onValueChange={(value) => onTimeChange(dayIndex, 'kitchen_close_time', value)}
                  disabled={dayData.is_closed || kitchenClosedDays.has(dayIndex)}
                >
                  <SelectTrigger id={`kitchen-close-${dayIndex}`}>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]" onWheel={(e) => e.stopPropagation()}>
                      {HOURS.map((hour) => (
                        <SelectItem key={hour.value} value={hour.value}>
                          {hour.label}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueHoursDayItem;
