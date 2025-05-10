
import React from 'react';
import { X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import TimeSelector from '../happy-hours/TimeSelector';
import type { VenueHour } from '@/types/venueHours';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VenueHourFormProps {
  venueHour: Partial<VenueHour>;
  index: number;
  HOURS: { value: string; label: string }[];
  hasKitchen: boolean;
  onRemove: () => void;
  onChange: (field: string, value: any) => void;
  onKitchenToggle: (isKitchenClosed: boolean) => void;
  isKitchenClosed: boolean;
}

const VenueHourForm = ({ 
  venueHour, 
  index, 
  HOURS, 
  hasKitchen,
  onRemove, 
  onChange,
  onKitchenToggle,
  isKitchenClosed
}: VenueHourFormProps) => {
  const dayName = DAYS_OF_WEEK[venueHour.day_of_week as number];

  return (
    <div className="p-4 border rounded-md relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor={`venue-hour-day-${index}`}>Day</Label>
            <Select
              value={venueHour.day_of_week?.toString()}
              onValueChange={(value) => onChange('day_of_week', parseInt(value))}
            >
              <SelectTrigger id={`venue-hour-day-${index}`} className="w-[140px]">
                <SelectValue placeholder="Select day">{dayName}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day, idx) => (
                  <SelectItem key={idx} value={idx.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Open</span>
            <Switch 
              checked={!venueHour.is_closed}
              onCheckedChange={(checked) => onChange('is_closed', !checked)}
            />
          </div>
        </div>
        
        <div className={`space-y-4 ${venueHour.is_closed ? 'opacity-50' : ''}`}>
          <div className="flex gap-4 items-center">
            <TimeSelector
              label="Venue Opens"
              id={`venue-open-${index}`}
              value={venueHour.venue_open_time || ''}
              onChange={(value) => onChange('venue_open_time', value)}
              options={HOURS}
              disabled={venueHour.is_closed}
            />
            
            <TimeSelector
              label="Venue Closes"
              id={`venue-close-${index}`}
              value={venueHour.venue_close_time || ''}
              onChange={(value) => onChange('venue_close_time', value)}
              options={HOURS}
              disabled={venueHour.is_closed}
            />
          </div>
          
          {hasKitchen && !venueHour.is_closed && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`kitchen-active-${index}`}>Kitchen Hours</Label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Open</span>
                  <Switch 
                    id={`kitchen-active-${index}`}
                    checked={!isKitchenClosed}
                    onCheckedChange={(checked) => onKitchenToggle(!checked)}
                  />
                </div>
              </div>
              
              <div className={`flex gap-4 items-center ${isKitchenClosed ? 'opacity-50' : ''}`}>
                <TimeSelector
                  label="Kitchen Opens"
                  id={`kitchen-open-${index}`}
                  value={venueHour.kitchen_open_time || ''}
                  onChange={(value) => onChange('kitchen_open_time', value)}
                  options={HOURS}
                  disabled={venueHour.is_closed || isKitchenClosed}
                />
                
                <TimeSelector
                  label="Kitchen Closes"
                  id={`kitchen-close-${index}`}
                  value={venueHour.kitchen_close_time || ''}
                  onChange={(value) => onChange('kitchen_close_time', value)}
                  options={HOURS}
                  disabled={venueHour.is_closed || isKitchenClosed}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueHourForm;
