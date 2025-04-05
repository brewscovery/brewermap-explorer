
import React, { useState, useEffect } from 'react';
import { Beer, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VenueHappyHour } from '@/types/venueHappyHours';
import { formatTimeForForm } from '../hours/hoursUtils';
import HappyHourForm from './HappyHourForm';
import EmptyHappyHoursState from './EmptyHappyHoursState';

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
        <EmptyHappyHoursState />
      ) : (
        <div className="space-y-6">
          {formData.map((happyHour, index) => (
            <HappyHourForm 
              key={index}
              happyHour={happyHour}
              index={index}
              HOURS={HOURS}
              onRemove={() => removeHappyHour(index)}
              onChange={(field, value) => handleChange(index, field, value)}
            />
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
