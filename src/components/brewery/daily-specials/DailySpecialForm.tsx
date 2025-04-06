
import React from 'react';
import { X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import type { VenueDailySpecial } from '@/types/venueDailySpecials';
import TimeSelector from '../happy-hours/TimeSelector';

interface DailySpecialFormProps {
  dailySpecial: Partial<VenueDailySpecial>;
  index: number;
  HOURS: { value: string; label: string }[];
  onRemove: () => void;
  onChange: (field: string, value: any) => void;
}

const DailySpecialForm = ({ 
  dailySpecial, 
  index, 
  HOURS, 
  onRemove, 
  onChange 
}: DailySpecialFormProps) => {
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
            <Label htmlFor={`daily-special-day-${index}`}>Day</Label>
            <Select
              value={dailySpecial.day_of_week?.toString()}
              onValueChange={(value) => onChange('day_of_week', parseInt(value))}
            >
              <SelectTrigger id={`daily-special-day-${index}`} className="w-[140px]">
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
              checked={dailySpecial.is_active}
              onCheckedChange={(checked) => onChange('is_active', checked)}
            />
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <TimeSelector
            label="Start Time"
            id={`daily-special-start-${index}`}
            value={dailySpecial.start_time || ''}
            onChange={(value) => onChange('start_time', value)}
            options={HOURS}
          />
          
          <TimeSelector
            label="End Time"
            id={`daily-special-end-${index}`}
            value={dailySpecial.end_time || ''}
            onChange={(value) => onChange('end_time', value)}
            options={HOURS}
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor={`daily-special-desc-${index}`} className="text-xs">Description</Label>
          <Textarea
            id={`daily-special-desc-${index}`}
            placeholder="e.g., $20 steaks on Thursday, half-price burgers..."
            value={dailySpecial.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            className="resize-none"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
};

export default DailySpecialForm;
