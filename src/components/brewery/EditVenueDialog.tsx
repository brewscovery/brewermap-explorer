
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog-fixed';
import { MapPin } from 'lucide-react';
import type { Venue } from '@/types/venue';
import { useVenueForm } from '@/hooks/useVenueForm';
import { VenueForm } from './venue-form/VenueForm';

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
  const {
    formData,
    setFormData,
    addressInput,
    setAddressInput,
    handleChange,
    handleAddressChange
  } = useVenueForm();
  
  // Update form when venue changes
  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name || '',
        street: venue.street || '',
        city: venue.city || '',
        state: venue.state || '',
        postal_code: venue.postal_code || '',
        country: venue.country || 'Australia', // Default to Australia if missing
        phone: venue.phone || '',
        website_url: venue.website_url || '',
        longitude: venue.longitude,
        latitude: venue.latitude
      });
      
      // Set address input to show the full address if available
      if (venue.street && venue.city && venue.state) {
        const fullAddress = [
          venue.street,
          venue.city,
          `${venue.state}${venue.postal_code ? ' ' + venue.postal_code : ''}`,
          venue.country
        ].filter(Boolean).join(', ');
        setAddressInput(fullAddress);
      } else {
        setAddressInput('');
      }
    }
  }, [venue, open]);

  // When dialog closes, ensure body is interactive
  useEffect(() => {
    if (!open) {
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    }
  }, [open]);

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
      // Ensure body is interactive after closing
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Ensure body is interactive when closing
      if (!newOpen) {
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-md" onCloseAutoFocus={(event) => {
        // Prevent default focus behavior to avoid issues
        event.preventDefault();
        
        // Force document.body to be interactive again
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
      }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Edit Venue
          </DialogTitle>
        </DialogHeader>
        
        <VenueForm
          formData={formData}
          addressInput={addressInput}
          isSubmitting={isUpdating}
          submitLabel="Update Venue"
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          handleAddressChange={handleAddressChange}
          setAddressInput={setAddressInput}
          onCancel={() => {
            // Ensure body is interactive when canceling
            document.body.style.pointerEvents = '';
            document.body.style.overflow = '';
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditVenueDialog;
