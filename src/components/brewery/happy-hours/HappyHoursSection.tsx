
import React, { useState, useEffect } from 'react';
import { Beer, Clock, Plus, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import type { VenueHappyHour } from '@/hooks/useVenueHappyHours';
import { formatTimeForForm } from '../hours/hoursUtils';

interface HappyHoursSectionProps {
  venueId: string;
  happyHours: VenueHappyHour[];
  HOURS: { value: string; label: string }[];
  onSave: (happyHours: Partial<VenueHappyHour>[]) => Promise<boolean>;
  isUpdating: boolean;
}

const HappyHoursSection = ({
  venueId,
  happyHours,
  HOURS,
  onSave,
  isUpdating
}: HappyHoursSectionProps) => {
  const [formData, setFormData] = useState<Partial<VenueHappyHour>[]>([]);
  
  // Initialize with existing happy hours or empty array
  useEffect(() => {
    console.log('Initializing happy hours form data with:', happyHours);
    if (happyHours.length > 0) {
      setFormData(happyHours.map(hour => ({
        ...hour,
        start_time: formatTimeForForm(hour.start_time),
        end_time: formatTimeForForm(hour.end_time)
      })));
    } else {
      // Clear form data if there are no happy hours
      setFormData([]);
    }
  }, [happyHours]);

  const addHappyHour = () => {
    console.log('Adding new happy hour to form data');
    setFormData(prev => [
      ...prev,
      {
        venue_id: venueId,
        day_of_week: 1, // Default to Monday
        start_time: '16:00', // Default to 4 PM
        end_time: '18:00', // Default to 6 PM
        description: '',
        is_active: true
      }
    ]);
  };

  const removeHappyHour = (index: number) => {
    setFormData(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: any) => {
    setFormData(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    console.log('Saving happy hours data:', formData);
    // Validate that all entries have day_of_week
    const validData = formData.map(hour => {
      if (typeof hour.day_of_week !== 'number') {
        console.error('Missing day_of_week for hour:', hour);
        throw new Error('All happy hours must have a day of week selected');
      }
      return hour;
    });
    
    await onSave(validData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <Beer className="h-5 w-5" />
          <span>Happy Hours</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={addHappyHour}
          disabled={isUpdating}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Happy Hour
        </Button>
      </div>
      
      {formData.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p>No happy hours configured</p>
          <p className="text-xs mt-1">Click "Add Happy Hour" to create one</p>
        </div>
      ) : (
        <div className="space-y-6">
          {formData.map((happyHour, index) => (
            <div key={index} className="p-4 border rounded-md relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => removeHappyHour(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`happy-hour-day-${index}`}>Day</Label>
                    <Select
                      value={happyHour.day_of_week?.toString()}
                      onValueChange={(value) => handleChange(index, 'day_of_week', parseInt(value))}
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
                      onCheckedChange={(checked) => handleChange(index, 'is_active', checked)}
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 items-center">
                  <div className="w-full space-y-1">
                    <Label htmlFor={`happy-hour-start-${index}`} className="text-xs">Start Time</Label>
                    <Select
                      value={happyHour.start_time || ''}
                      onValueChange={(value) => handleChange(index, 'start_time', value)}
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
                      onValueChange={(value) => handleChange(index, 'end_time', value)}
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
                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                    className="resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              {isUpdating ? 'Saving...' : 'Save Happy Hours'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HappyHoursSection;
