
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock, X, Utensils } from 'lucide-react';
import { useVenueHours } from '@/hooks/useVenueHours';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import { Switch } from '@/components/ui/switch';
import type { VenueHour } from '@/types/venueHours';
import type { Venue } from '@/types/venue';

interface VenueHoursDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue: Venue | null;
}

const VenueHoursDialog = ({ 
  open, 
  onOpenChange,
  venue
}: VenueHoursDialogProps) => {
  const [formData, setFormData] = useState<Array<Partial<VenueHour>>>([]);
  const { hours, isLoading, isUpdating, updateVenueHours } = useVenueHours(venue?.id || null);

  // Initialize form data with existing hours or default values for all days
  useEffect(() => {
    if (open && venue) {
      const initialData = DAYS_OF_WEEK.map((_, index) => {
        const existingHour = hours.find(h => h.day_of_week === index);
        
        return existingHour || {
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours for {venue.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading hours...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-[130px_1fr] gap-4 font-medium px-4 py-2 bg-muted/40 rounded-md">
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
                          <Input
                            id={`venue-open-${index}`}
                            type="time"
                            value={day.venue_open_time || ''}
                            onChange={(e) => handleTimeChange(index, 'venue_open_time', e.target.value)}
                            disabled={day.is_closed}
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={`venue-close-${index}`} className="text-xs">Close</Label>
                          <Input
                            id={`venue-close-${index}`}
                            type="time"
                            value={day.venue_close_time || ''}
                            onChange={(e) => handleTimeChange(index, 'venue_close_time', e.target.value)}
                            disabled={day.is_closed}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label htmlFor={`kitchen-open-${index}`} className="text-xs">Open</Label>
                          <Input
                            id={`kitchen-open-${index}`}
                            type="time"
                            value={day.kitchen_open_time || ''}
                            onChange={(e) => handleTimeChange(index, 'kitchen_open_time', e.target.value)}
                            disabled={day.is_closed}
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={`kitchen-close-${index}`} className="text-xs">Close</Label>
                          <Input
                            id={`kitchen-close-${index}`}
                            type="time"
                            value={day.kitchen_close_time || ''}
                            onChange={(e) => handleTimeChange(index, 'kitchen_close_time', e.target.value)}
                            disabled={day.is_closed}
                          />
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
