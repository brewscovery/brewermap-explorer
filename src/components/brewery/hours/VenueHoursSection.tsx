
import React, { useState, useEffect } from 'react';
import { Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { VenueHour } from '@/types/venueHours';
import { formatTimeForForm } from './hoursUtils';
import VenueHourForm from './VenueHourForm';
import { DAYS_OF_WEEK } from '@/types/venueHours';

interface VenueHoursSectionProps {
  venueId: string;
  hours: VenueHour[];
  HOURS: { value: string; label: string }[];
  hasKitchen: boolean;
  setHasKitchen: (value: boolean) => void;
  onSave: (hours: Partial<VenueHour>[]) => Promise<boolean>;
  isUpdating: boolean;
}

const VenueHoursSection = ({
  venueId,
  hours,
  HOURS,
  hasKitchen,
  setHasKitchen,
  onSave,
  isUpdating
}: VenueHoursSectionProps) => {
  const [formData, setFormData] = useState<Partial<VenueHour>[]>([]);
  const [kitchenClosedDays, setKitchenClosedDays] = useState<Set<number>>(new Set());
  
  // Initialize with existing venue hours or empty array
  useEffect(() => {
    console.log('Initializing venue hours form data with:', hours);
    
    if (hours.length > 0) {
      // Format hours for the form
      const initialData = [...hours].sort((a, b) => a.day_of_week - b.day_of_week)
        .map(hour => ({
          ...hour,
          venue_open_time: formatTimeForForm(hour.venue_open_time),
          venue_close_time: formatTimeForForm(hour.venue_close_time),
          kitchen_open_time: formatTimeForForm(hour.kitchen_open_time),
          kitchen_close_time: formatTimeForForm(hour.kitchen_close_time),
        }));
      
      setFormData(initialData);
      
      // Set kitchen closed days
      const closedDays = new Set<number>();
      hours.forEach(hour => {
        if (!hour.is_closed && (!hour.kitchen_open_time || !hour.kitchen_close_time)) {
          closedDays.add(hour.day_of_week);
        }
      });
      setKitchenClosedDays(closedDays);
    } else {
      // Initialize with default hours for all seven days
      const defaultHours = DAYS_OF_WEEK.map((_, index) => ({
        venue_id: venueId,
        day_of_week: index,
        venue_open_time: '09:00',
        venue_close_time: '18:00',
        kitchen_open_time: '11:00',
        kitchen_close_time: '17:00',
        is_closed: false
      }));
      setFormData(defaultHours);
      setKitchenClosedDays(new Set());
    }
  }, [hours, venueId]);

  const addHour = () => {
    // Find a day that doesn't already have hours set
    const existingDays = new Set(formData.map(h => h.day_of_week));
    let newDay = 0;
    while (existingDays.has(newDay) && newDay < 7) {
      newDay++;
    }
    
    // If all days are used, just add Monday again
    if (newDay >= 7) newDay = 0;
    
    setFormData(prev => [
      ...prev,
      {
        venue_id: venueId,
        day_of_week: newDay,
        venue_open_time: '09:00',
        venue_close_time: '18:00',
        kitchen_open_time: hasKitchen ? '11:00' : null,
        kitchen_close_time: hasKitchen ? '17:00' : null,
        is_closed: false
      }
    ]);
  };

  const removeHour = (index: number) => {
    setFormData(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: any) => {
    setFormData(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleKitchenToggle = (index: number, isClosed: boolean) => {
    const hourData = formData[index];
    if (!hourData || hourData.is_closed) return;
    
    const dayIndex = hourData.day_of_week as number;
    
    setKitchenClosedDays(prev => {
      const updated = new Set(prev);
      if (isClosed) {
        updated.add(dayIndex);
        // Also update form data to clear kitchen hours
        setFormData(prev => prev.map((item, i) => 
          i === index ? { 
            ...item, 
            kitchen_open_time: null, 
            kitchen_close_time: null 
          } : item
        ));
      } else {
        updated.delete(dayIndex);
        // Reset kitchen hours to default when enabling
        setFormData(prev => prev.map((item, i) => 
          i === index ? { 
            ...item, 
            kitchen_open_time: '11:00', 
            kitchen_close_time: '17:00' 
          } : item
        ));
      }
      return updated;
    });
  };

  const handleSave = async () => {
    console.log('[VenueHoursSection] SAVE BUTTON CLICKED - Starting save process');
    console.log('[VenueHoursSection] Form data to save:', formData);
    
    // Validate that all entries have day_of_week
    const validData = formData.map(hour => {
      if (typeof hour.day_of_week !== 'number') {
        console.error('Missing day_of_week for hour:', hour);
        throw new Error('All venue hours must have a day of week selected');
      }
      return hour;
    });
    
    console.log('[VenueHoursSection] Calling onSave with valid data:', validData);
    const result = await onSave(validData);
    console.log('[VenueHoursSection] onSave result:', result);
  };

  const toggleHasKitchen = (value: boolean) => {
    setHasKitchen(value);
    
    // If disabling kitchen, clear all kitchen times
    if (!value) {
      setFormData(prev => prev.map(item => ({
        ...item,
        kitchen_open_time: null,
        kitchen_close_time: null
      })));
      setKitchenClosedDays(new Set());
    } else {
      // If enabling kitchen, set default kitchen times for all open days
      setFormData(prev => prev.map(item => ({
        ...item,
        kitchen_open_time: item.is_closed ? null : '11:00',
        kitchen_close_time: item.is_closed ? null : '17:00',
      })));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <Clock className="h-5 w-5" />
          <span>Venue Hours</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Kitchen Hours</span>
            <Switch 
              checked={hasKitchen}
              onCheckedChange={toggleHasKitchen}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addHour}
            disabled={isUpdating}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Day
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {formData.map((hour, index) => (
          <VenueHourForm 
            key={index}
            venueHour={hour}
            index={index}
            HOURS={HOURS}
            hasKitchen={hasKitchen}
            onRemove={() => removeHour(index)}
            onChange={(field, value) => handleChange(index, field, value)}
            onKitchenToggle={(isClosed) => handleKitchenToggle(index, isClosed)}
            isKitchenClosed={kitchenClosedDays.has(hour.day_of_week as number)}
          />
        ))}
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isUpdating}
            className="w-full sm:w-auto"
          >
            {isUpdating ? 'Saving...' : 'Save Hours'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VenueHoursSection;
