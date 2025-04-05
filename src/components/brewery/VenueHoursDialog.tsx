
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Clock, Utensils, BellOff } from 'lucide-react';
import { useVenueHours } from '@/hooks/useVenueHours';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
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

const formatTimeForForm = (time: string | null) => {
  if (!time) return null;
  return time.substring(0, 5); // Convert "HH:MM:SS" to "HH:MM"
};

const VenueHoursDialog = ({ 
  open, 
  onOpenChange,
  venue
}: VenueHoursDialogProps) => {
  const [formData, setFormData] = useState<Array<Partial<VenueHour>>>([]);
  const [hasKitchen, setHasKitchen] = useState<boolean>(true);
  const [kitchenClosedDays, setKitchenClosedDays] = useState<Set<number>>(new Set());
  const { hours, isLoading, isUpdating, updateVenueHours } = useVenueHours(venue?.id || null);

  // Initialize or reset form data when dialog opens or venue changes
  useEffect(() => {
    if (open && venue) {
      console.log("Updating form with loaded hours:", hours);
      
      const initialData = DAYS_OF_WEEK.map((_, index) => {
        const existingHour = hours.find(h => h.day_of_week === index);
        
        if (existingHour) {
          return {
            ...existingHour,
            venue_open_time: formatTimeForForm(existingHour.venue_open_time),
            venue_close_time: formatTimeForForm(existingHour.venue_close_time),
            kitchen_open_time: formatTimeForForm(existingHour.kitchen_open_time),
            kitchen_close_time: formatTimeForForm(existingHour.kitchen_close_time),
          };
        }

        return {
          venue_id: venue.id,
          day_of_week: index,
          venue_open_time: '09:00',
          venue_close_time: '18:00',
          kitchen_open_time: '11:00',
          kitchen_close_time: '17:00',
          is_closed: index === 0, // Default to closed on Sundays
        };
      });
      
      setFormData(initialData);
      
      // Check if venue has any kitchen hours set
      const venueHasKitchen = hours.some(
        hour => hour.kitchen_open_time !== null || hour.kitchen_close_time !== null
      );
      setHasKitchen(venueHasKitchen || hours.length === 0);
      
      // Initialize kitchen closed days
      const closedKitchenDays = new Set<number>();
      hours.forEach(hour => {
        if (!hour.is_closed && hour.venue_open_time && hour.venue_close_time && 
            (!hour.kitchen_open_time || !hour.kitchen_close_time)) {
          closedKitchenDays.add(hour.day_of_week);
        }
      });
      setKitchenClosedDays(closedKitchenDays);
    }
  }, [open, venue, hours]);

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

  const handleHasKitchenToggle = (value: boolean) => {
    setHasKitchen(value);
    
    if (!value) {
      // Clear all kitchen hours when toggling kitchen off
      setFormData(prev => prev.map(day => ({
        ...day,
        kitchen_open_time: null,
        kitchen_close_time: null
      })));
      setKitchenClosedDays(new Set());
    } else {
      // Set default kitchen hours when toggling kitchen on
      setFormData(prev => prev.map(day => ({
        ...day,
        kitchen_open_time: day.is_closed ? null : '11:00',
        kitchen_close_time: day.is_closed ? null : '17:00'
      })));
    }
  };

  const handleSave = async () => {
    if (!venue) return;
    
    const formattedData = formData.map(day => {
      const dayIndex = day.day_of_week as number;
      const isKitchenClosed = kitchenClosedDays.has(dayIndex);
      
      return {
        ...day,
        venue_open_time: day.venue_open_time ? `${day.venue_open_time}:00` : null,
        venue_close_time: day.venue_close_time ? `${day.venue_close_time}:00` : null,
        kitchen_open_time: hasKitchen && !isKitchenClosed && day.kitchen_open_time ? `${day.kitchen_open_time}:00` : null,
        kitchen_close_time: hasKitchen && !isKitchenClosed && day.kitchen_close_time ? `${day.kitchen_close_time}:00` : null,
      };
    });
    
    const success = await updateVenueHours(formattedData);
    if (success) {
      onOpenChange(false);
    }
  };

  if (!venue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours for {venue.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(80vh-120px)] pr-4">
            <div className="px-1 py-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <p>Loading hours...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4" />
                      <span className="font-medium">This venue has a kitchen</span>
                    </div>
                    <Switch 
                      checked={hasKitchen}
                      onCheckedChange={handleHasKitchenToggle}
                    />
                  </div>
                  
                  <div className="grid grid-cols-[130px_1fr] gap-4 font-medium px-4 py-2 bg-muted/40 rounded-md sticky top-0 z-10">
                    <div>Day</div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>Venue Hours</div>
                      {hasKitchen && <div>Kitchen Hours</div>}
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
                            {!day.is_closed && (
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <BellOff className="h-3 w-3" />
                                  <span>Kitchen closed this day</span>
                                </div>
                                <Switch 
                                  id={`kitchen-closed-${index}`} 
                                  checked={kitchenClosedDays.has(index)}
                                  onCheckedChange={(checked) => handleKitchenClosedToggle(index, checked)}
                                  disabled={day.is_closed}
                                  size="sm"
                                />
                              </div>
                            )}
                            
                            <div className={`flex gap-2 items-end ${kitchenClosedDays.has(index) ? 'opacity-50' : ''}`}>
                              <div className="flex-1">
                                <Label htmlFor={`kitchen-open-${index}`} className="text-xs">Open</Label>
                                <Select
                                  value={day.kitchen_open_time || ''}
                                  onValueChange={(value) => handleTimeChange(index, 'kitchen_open_time', value)}
                                  disabled={day.is_closed || kitchenClosedDays.has(index)}
                                >
                                  <SelectTrigger id={`kitchen-open-${index}`}>
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
                                <Label htmlFor={`kitchen-close-${index}`} className="text-xs">Close</Label>
                                <Select
                                  value={day.kitchen_close_time || ''}
                                  onValueChange={(value) => handleTimeChange(index, 'kitchen_close_time', value)}
                                  disabled={day.is_closed || kitchenClosedDays.has(index)}
                                >
                                  <SelectTrigger id={`kitchen-close-${index}`}>
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
                  ))}

                  <div className="grid grid-cols-[130px_1fr] gap-4 mt-4">
                    <div></div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={14} />
                        <span>Venue hours</span>
                      </div>
                      {hasKitchen && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Utensils size={14} />
                          <span>Kitchen hours</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
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
