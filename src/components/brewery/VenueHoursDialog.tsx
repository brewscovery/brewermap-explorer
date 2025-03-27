
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Clock, X, Utensils } from 'lucide-react';
import { useVenueHours } from '@/hooks/useVenueHours';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { VenueHour } from '@/types/venueHours';
import type { Venue } from '@/types/venue';

interface VenueHoursDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue: Venue | null;
}

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 || 12;
  const ampm = i < 12 ? 'AM' : 'PM';
  return { value: `${i.toString().padStart(2, '0')}:00`, label: `${hour}:00 ${ampm}` };
});

const VenueHoursDialog = ({ 
  open, 
  onOpenChange,
  venue
}: VenueHoursDialogProps) => {
  const [formData, setFormData] = useState<Array<Partial<VenueHour>>>([]);
  const { hours, isLoading, isUpdating, updateVenueHours } = useVenueHours(venue?.id || null);
  const [formInitialized, setFormInitialized] = useState(false);

  // Initialize form data with default values when the dialog opens
  useEffect(() => {
    if (open && venue) {
      // Initialize with default values for all days
      const initialData = DAYS_OF_WEEK.map((_, index) => ({
        venue_id: venue.id,
        day_of_week: index,
        venue_open_time: '09:00',
        venue_close_time: '18:00',
        kitchen_open_time: '11:00',
        kitchen_close_time: '17:00',
        is_closed: index === 0, // Default to closed on Sundays
      }));
      
      setFormData(initialData);
      setFormInitialized(false);  // Reset form initialization flag
    }
  }, [open, venue]);

  // Update form data with existing hours once they're loaded
  useEffect(() => {
    if (open && venue && hours.length > 0 && !isLoading && !formInitialized) {
      console.log('Updating form with loaded hours:', hours);
      
      const updatedFormData = [...formData];
      
      // Update the form data with any existing hours
      hours.forEach(hour => {
        const dayIndex = hour.day_of_week;
        if (dayIndex >= 0 && dayIndex < updatedFormData.length) {
          updatedFormData[dayIndex] = {
            ...hour
          };
        }
      });
      
      setFormData(updatedFormData);
      setFormInitialized(true);  // Mark form as initialized with real data
    }
  }, [hours, isLoading, open, venue, formData, formInitialized]);

  const handleTimeChange = (dayIndex: number, field: string, value: string) => {
    setFormData(prev => prev.map((day, idx) => 
      idx === dayIndex ? { ...day, [field]: value } : day
    ));
  };

  const handleClosedToggle = (dayIndex: number, value: boolean) => {
    setFormData(prev => prev.map((day, idx) => 
      idx === dayIndex ? { ...day, is_closed: value } : day
    ));
  };

  const handleSave = async () => {
    if (!venue) return;
    
    const success = await updateVenueHours(formData);
    if (success) {
      onOpenChange(false);
    }
  };

  if (!venue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours for {venue.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 overflow-y-auto flex-1 pr-2">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading hours...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-[130px_1fr] gap-4 font-medium px-4 py-2 bg-muted/40 rounded-md sticky top-0">
                <div>Day</div>
                <div className="grid grid-cols-2 gap-6">
                  <div>Venue Hours</div>
                  <div>Kitchen Hours</div>
                </div>
              </div>
              
              {formData.map((day, index) => (
                <div key={index} className={`grid grid-cols-[130px_1fr] gap-4 ${day.is_closed ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{DAYS_OF_WEEK[index]}</span>
                    <Switch 
                      id={`closed-${index}`} 
                      checked={!day.is_closed}
                      onCheckedChange={(checked) => handleClosedToggle(index, !checked)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label htmlFor={`venue-open-${index}`} className="text-xs">Open</Label>
                          <Select
                            value={day.venue_open_time || ''}
                            onValueChange={(value) => handleTimeChange(index, 'venue_open_time', value)}
                            disabled={day.is_closed}
                          >
                            <SelectTrigger id={`venue-open-${index}`}>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {HOURS.map((hour) => (
                                <SelectItem key={hour.value} value={hour.value}>
                                  {hour.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={`venue-close-${index}`} className="text-xs">Close</Label>
                          <Select
                            value={day.venue_close_time || ''}
                            onValueChange={(value) => handleTimeChange(index, 'venue_close_time', value)}
                            disabled={day.is_closed}
                          >
                            <SelectTrigger id={`venue-close-${index}`}>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {HOURS.map((hour) => (
                                <SelectItem key={hour.value} value={hour.value}>
                                  {hour.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label htmlFor={`kitchen-open-${index}`} className="text-xs">Open</Label>
                          <Select
                            value={day.kitchen_open_time || ''}
                            onValueChange={(value) => handleTimeChange(index, 'kitchen_open_time', value)}
                            disabled={day.is_closed}
                          >
                            <SelectTrigger id={`kitchen-open-${index}`}>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {HOURS.map((hour) => (
                                <SelectItem key={hour.value} value={hour.value}>
                                  {hour.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={`kitchen-close-${index}`} className="text-xs">Close</Label>
                          <Select
                            value={day.kitchen_close_time || ''}
                            onValueChange={(value) => handleTimeChange(index, 'kitchen_close_time', value)}
                            disabled={day.is_closed}
                          >
                            <SelectTrigger id={`kitchen-close-${index}`}>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {HOURS.map((hour) => (
                                <SelectItem key={hour.value} value={hour.value}>
                                  {hour.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-[130px_1fr] gap-4 mt-4">
                <div></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={14} />
                    <span>Venue hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Utensils size={14} />
                    <span>Kitchen hours</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Hours'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VenueHoursDialog;
