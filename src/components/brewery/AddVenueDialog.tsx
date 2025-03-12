
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVenueForm } from '@/hooks/useVenueForm';
import { VenueForm } from './venue-form/VenueForm';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  
  const {
    formData,
    addressInput,
    isLoading,
    setIsLoading,
    setAddressInput,
    handleChange,
    handleAddressChange,
    validateForm,
    getCoordinates,
    resetForm
  } = useVenueForm();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!breweryId) {
      toast.error('Brewery ID is missing');
      return;
    }

    setIsLoading(true);

    try {
      // Get coordinates if needed
      const { longitude, latitude } = await getCoordinates();

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

      // Explicitly invalidate venue queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['breweryVenues', breweryId] });
      
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
        
        <VenueForm
          formData={formData}
          addressInput={addressInput}
          isSubmitting={isLoading}
          submitLabel="Add Venue"
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          handleAddressChange={handleAddressChange}
          setAddressInput={setAddressInput}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddVenueDialog;
