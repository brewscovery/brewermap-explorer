
import React from 'react';
import { Clock, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import type { VenueHappyHour } from '@/types/venueHappyHours';

interface HappyHourFormProps {
  happyHour: Partial<VenueHappyHour>;
  index: number;
  HOURS: { value: string; label: string }[];
  onRemove: () => void;
  onChange: (field: string, value: any) => void;
}

const HappyHourForm = ({ 
  happyHour, 
  index, 
  HOURS, 
  onRemove, 
  onChange 
}: HappyHourFormProps) => {
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
            <Label htmlFor={`happy-hour-day-${index}`}>Day</Label>
            <Select
              value={happyHour.day_of_week?.toString()}
              onValueChange={(value) => onChange('day_of_week', parseInt(value))}
            >
              <SelectTrigger id={`happy-hour-day-${index}`} className="w-[140px]">
                <SelectValue placeholder="Select day" />
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
            <span className="text-sm">Active</span>
            <Switch 
              checked={happyHour.is_active}
              onCheckedChange={(checked) => onChange('is_active', checked)}
            />
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="w-full space-y-1">
            <Label htmlFor={`happy-hour-start-${index}`} className="text-xs">Start Time</Label>
            <Select
              value={happyHour.start_time || ''}
              onValueChange={(value) => onChange('start_time', value)}
            >
              <SelectTrigger id={`happy-hour-start-${index}`}>
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
          
          <div className="w-full space-y-1">
            <Label htmlFor={`happy-hour-end-${index}`} className="text-xs">End Time</Label>
            <Select
              value={happyHour.end_time || ''}
              onValueChange={(value) => onChange('end_time', value)}
            >
              <SelectTrigger id={`happy-hour-end-${index}`}>
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
        
        <div className="space-y-1">
          <Label htmlFor={`happy-hour-desc-${index}`} className="text-xs">Description</Label>
          <Textarea
            id={`happy-hour-desc-${index}`}
            placeholder="e.g., $2 off all draft beers, half-price appetizers..."
            value={happyHour.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            className="resize-none"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
};

export default HappyHourForm;
