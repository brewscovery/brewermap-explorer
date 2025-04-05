
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import VenueHoursHeader from './VenueHoursHeader';
import VenueHoursColumnHeaders from './VenueHoursColumnHeaders';
import VenueHoursDayItem from './VenueHoursDayItem';
import VenueHoursLegend from './VenueHoursLegend';
import { DAYS_OF_WEEK, VenueHour } from '@/types/venueHours';

interface RegularHoursTabProps {
  hours: VenueHour[];
  formData: Array<Partial<VenueHour>>;
  setFormData: React.Dispatch<React.SetStateAction<Array<Partial<VenueHour>>>>;
  hasKitchen: boolean;
  setHasKitchen: (value: boolean) => void;
  kitchenClosedDays: Set<number>;
  setKitchenClosedDays: React.Dispatch<React.SetStateAction<Set<number>>>;
  HOURS: { value: string; label: string }[];
}

const RegularHoursTab = ({
  formData,
  setFormData,
  hasKitchen,
  setHasKitchen,
  kitchenClosedDays,
  setKitchenClosedDays,
  HOURS
}: RegularHoursTabProps) => {
  const handleTimeChange = (dayIndex: number, field: string, value: string) => {
    setFormData(prev => prev.map((day, idx) => 
      idx === dayIndex ? { ...day, [field]: value } : day
    ));
  };

  const handleClosedToggle = (dayIndex: number, value: boolean) => {
    setFormData(prev => prev.map((day, idx) => 
      idx === dayIndex ? { ...day, is_closed: value } : day
    ));
    
    // If venue is closed, also remove from kitchen closed days
    if (value) {
      setKitchenClosedDays(prev => {
        const updated = new Set(prev);
        updated.delete(dayIndex);
        return updated;
      });
    }
  };

  const handleKitchenClosedToggle = (dayIndex: number, isClosed: boolean) => {
    setKitchenClosedDays(prev => {
      const updated = new Set(prev);
      if (isClosed) {
        updated.add(dayIndex);
      } else {
        updated.delete(dayIndex);
      }
      return updated;
    });
    
    // If kitchen is marked as closed, clear kitchen hours
    if (isClosed) {
      setFormData(prev => prev.map((day, idx) => 
        idx === dayIndex ? { 
          ...day, 
          kitchen_open_time: null, 
          kitchen_close_time: null 
        } : day
      ));
    } else {
      // Set default kitchen hours when re-enabling kitchen
      setFormData(prev => prev.map((day, idx) => 
        idx === dayIndex ? { 
          ...day, 
          kitchen_open_time: '11:00', 
          kitchen_close_time: '17:00' 
        } : day
      ));
    }
  };

  return (
    <ScrollArea className="h-[calc(80vh-160px)] pr-4">
      <div className="px-1 py-4">
        <div className="space-y-6">
          <VenueHoursHeader 
            hasKitchen={hasKitchen}
            onHasKitchenToggle={setHasKitchen}
          />
          
          <VenueHoursColumnHeaders hasKitchen={hasKitchen} />
          
          {formData.map((day, index) => (
            <VenueHoursDayItem
              key={index}
              day={DAYS_OF_WEEK[index]}
              dayIndex={index}
              dayData={day}
              hasKitchen={hasKitchen}
              kitchenClosedDays={kitchenClosedDays}
              HOURS={HOURS}
              onClosedToggle={handleClosedToggle}
              onTimeChange={handleTimeChange}
              onKitchenClosedToggle={handleKitchenClosedToggle}
            />
          ))}

          <VenueHoursLegend hasKitchen={hasKitchen} />
        </div>
      </div>
    </ScrollArea>
  );
};

export default RegularHoursTab;
