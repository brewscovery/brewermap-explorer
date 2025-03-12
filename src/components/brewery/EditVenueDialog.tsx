
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import type { Venue } from '@/types/venue';

interface EditVenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue: Venue | null;
  onVenueUpdated: (venueId: string, venueData: Partial<Venue>) => Promise<boolean>;
  isUpdating: boolean;
}

const EditVenueDialog = ({ 
  open, 
  onOpenChange, 
  venue,
  onVenueUpdated,
  isUpdating
}: EditVenueDialogProps) => {
  const [formData, setFormData] = useState<Partial<Venue>>({
    name: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
    website_url: ''
  });

  // Reset and populate form when dialog opens or venue changes
  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name || '',
        street: venue.street || '',
        city: venue.city || '',
        state: venue.state || '',
        postal_code: venue.postal_code || '',
        phone: venue.phone || '',
        website_url: venue.website_url || ''
      });
    }
  }, [venue, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.city || !formData.state) {
      return;
    }

    if (!venue?.id) {
      return;
    }

    const success = await onVenueUpdated(venue.id, formData);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Edit Venue
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Venue Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Main Taproom"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              name="street"
              value={formData.street || ''}
              onChange={handleChange}
              placeholder="123 Brewery St"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Portland"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="OR"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
              id="postal_code"
              name="postal_code"
              value={formData.postal_code || ''}
              onChange={handleChange}
              placeholder="97201"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="(555) 123-4567"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website_url">Website</Label>
            <Input
              id="website_url"
              name="website_url"
              value={formData.website_url || ''}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Venue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditVenueDialog;
