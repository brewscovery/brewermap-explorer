
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import { AddressInput } from '@/components/ui/address-input';
import type { AddressSuggestion } from '@/types/address';

interface AddVenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breweryId: string;
  onVenueAdded: () => void;
}

const AddVenueDialog = ({ 
  open, 
  onOpenChange, 
  breweryId, 
  onVenueAdded 
}: AddVenueDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Australia', // Default to Australia
    phone: '',
    website_url: '',
    longitude: null as string | null,
    latitude: null as string | null
  });
  const [addressInput, setAddressInput] = useState('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Australia', // Default to Australia
        phone: '',
        website_url: '',
        longitude: null,
        latitude: null
      });
      setAddressInput('');
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (suggestion: AddressSuggestion | null) => {
    if (suggestion) {
      setFormData(prev => ({
        ...prev,
        street: suggestion.street,
        city: suggestion.city,
        state: suggestion.state,
        postal_code: suggestion.postalCode,
        country: suggestion.country,
        longitude: suggestion.longitude,
        latitude: suggestion.latitude
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.city || !formData.state) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!breweryId) {
      toast.error('Brewery ID is missing');
      return;
    }

    setIsLoading(true);

    try {
      // Use coordinates from address suggestion, or fallback to geocoding
      let longitude = formData.longitude;
      let latitude = formData.latitude;

      // Only geocode if we don't already have coordinates and we have address components
      if (!longitude || !latitude) {
        if (formData.street && formData.city && formData.state) {
          try {
            const geocodeResponse = await supabase.functions.invoke('geocode', {
              body: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postal_code
              }
            });

            if (geocodeResponse.data) {
              longitude = geocodeResponse.data.longitude;
              latitude = geocodeResponse.data.latitude;
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            // Continue without coordinates if geocoding fails
          }
        }
      }

      // Insert the new venue
      const { data, error } = await supabase
        .from('venues')
        .insert({
          brewery_id: breweryId,
          name: formData.name,
          street: formData.street || null,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code || null,
          country: formData.country || null,
          phone: formData.phone || null,
          website_url: formData.website_url || null,
          longitude,
          latitude
        })
        .select();

      if (error) {
        throw error;
      }

      toast.success('Venue added successfully');
      onVenueAdded();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding venue:', error);
      toast.error(error.message || 'Failed to add venue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add New Venue
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
            <Label htmlFor="address">Address *</Label>
            <AddressInput 
              value={addressInput}
              onChange={handleAddressChange}
              onInputChange={setAddressInput}
              placeholder="123 Brewery St, Portland, OR"
              required
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
              <Label htmlFor="state">State/Province *</Label>
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
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="97201"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="United States"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website_url">Website</Label>
            <Input
              id="website_url"
              name="website_url"
              value={formData.website_url}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Venue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVenueDialog;
