
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Venue } from '@/types/venue';
import { VenueForm } from '@/components/brewery/venue-form/VenueForm';
import { useVenueForm } from '@/hooks/useVenueForm';
import { toast } from 'sonner';

interface VenueDetailsTabProps {
  venue: Venue;
  onUpdate: (venueId: string, venueData: Partial<Venue>) => Promise<boolean>;
  isUpdating: boolean;
}

export const VenueDetailsTab = ({ 
  venue, 
  onUpdate,
  isUpdating 
}: VenueDetailsTabProps) => {
  const {
    formData,
    setFormData,
    addressInput,
    setAddressInput,
    handleChange,
    handleAddressChange
  } = useVenueForm();
  
  // Initialize form data from venue
  React.useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name || '',
        street: venue.street || '',
        city: venue.city || '',
        state: venue.state || '',
        postal_code: venue.postal_code || '',
        country: venue.country || 'Australia', // Default to Australia if missing
        phone: venue.phone || '',
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
  }, [venue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.city || !formData.state) {
      toast.error('Please fill in all required fields');
      return;
    }

    const success = await onUpdate(venue.id, formData);
    if (success) {
      toast.success('Venue details updated successfully');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venue Details</CardTitle>
        <CardDescription>
          Update your venue's basic information and location
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VenueForm
          formData={formData}
          addressInput={addressInput}
          isSubmitting={isUpdating}
          submitLabel="Update Venue Details"
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          handleAddressChange={handleAddressChange}
          setAddressInput={setAddressInput}
        />
      </CardContent>
    </Card>
  );
};
