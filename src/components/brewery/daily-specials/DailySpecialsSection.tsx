
import React, { useState, useEffect } from 'react';
import { MenuSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VenueDailySpecial } from '@/types/venueDailySpecials';
import { formatTimeForForm } from '../hours/hoursUtils';
import DailySpecialForm from './DailySpecialForm';
import EmptyDailySpecialsState from './EmptyDailySpecialsState';

interface DailySpecialsSectionProps {
  venueId: string;
  dailySpecials: VenueDailySpecial[];
  HOURS: { value: string; label: string }[];
  onSave: (dailySpecials: Partial<VenueDailySpecial>[]) => Promise<boolean>;
  isUpdating: boolean;
}

const DailySpecialsSection = ({
  venueId,
  dailySpecials,
  HOURS,
  onSave,
  isUpdating
}: DailySpecialsSectionProps) => {
  const [formData, setFormData] = useState<Partial<VenueDailySpecial>[]>([]);
  
  // Initialize with existing daily specials or empty array
  useEffect(() => {
    console.log('Initializing daily specials form data with:', dailySpecials);
    if (dailySpecials.length > 0) {
      setFormData(dailySpecials.map(special => ({
        ...special,
        start_time: formatTimeForForm(special.start_time),
        end_time: formatTimeForForm(special.end_time)
      })));
    } else {
      // Clear form data if there are no daily specials
      setFormData([]);
    }
  }, [dailySpecials]);

  const addDailySpecial = () => {
    console.log('Adding new daily special to form data');
    setFormData(prev => [
      ...prev,
      {
        venue_id: venueId,
        day_of_week: 4, // Default to Thursday
        start_time: '16:00', // Default to 4 PM
        end_time: '20:00', // Default to 8 PM
        description: '',
        is_active: true
      }
    ]);
  };

  const removeDailySpecial = (index: number) => {
    setFormData(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: any) => {
    setFormData(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    console.log('Saving daily specials data:', formData);
    // Validate that all entries have day_of_week
    const validData = formData.map(special => {
      if (typeof special.day_of_week !== 'number') {
        console.error('Missing day_of_week for special:', special);
        throw new Error('All daily specials must have a day of week selected');
      }
      return special;
    });
    
    await onSave(validData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <MenuSquare className="h-5 w-5" />
          <span>Daily Specials</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={addDailySpecial}
          disabled={isUpdating}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Daily Special
        </Button>
      </div>
      
      {formData.length === 0 ? (
        <EmptyDailySpecialsState />
      ) : (
        <div className="space-y-6">
          {formData.map((dailySpecial, index) => (
            <DailySpecialForm 
              key={index}
              dailySpecial={dailySpecial}
              index={index}
              HOURS={HOURS}
              onRemove={() => removeDailySpecial(index)}
              onChange={(field, value) => handleChange(index, field, value)}
            />
          ))}
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              {isUpdating ? 'Saving...' : 'Save Daily Specials'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailySpecialsSection;
