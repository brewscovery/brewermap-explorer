
import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog-fixed';
import { MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVenueForm } from '@/hooks/useVenueForm';
import { VenueForm } from './venue-form/VenueForm';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateVenueHours } from '@/hooks/useCreateVenueHours';

interface AddVenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breweryId: string;
  breweryName: string;
  onVenueAdded: () => void;
}

const AddVenueDialog = ({ 
  open, 
  onOpenChange, 
  breweryId,
  breweryName,
  onVenueAdded 
}: AddVenueDialogProps) => {
  const queryClient = useQueryClient();
  const { createDefaultVenueHours } = useCreateVenueHours();
  const initialRenderRef = useRef(true);
  const nameSetRef = useRef(false);
  
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

  // Reset form when dialog opens/closes and prefill name only ONCE when opened
  useEffect(() => {
    if (!open) {
      resetForm();
      nameSetRef.current = false; // Reset the flag when dialog closes
      // Ensure body is interactive when closed
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    } else if (open && breweryName && !nameSetRef.current) {
      // Only prefill name if dialog is opening AND name hasn't been set yet
      nameSetRef.current = true; // Mark that we've set the name
      
      // Skip the prefill on the first render to avoid overwriting the value
      if (!initialRenderRef.current) {
        handleChange({
          target: { name: 'name', value: breweryName }
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }
    
    // After first render, set initialRender to false
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
    }
  }, [open, resetForm, breweryName, handleChange, formData.name]);

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
          longitude,
          latitude
        })
        .select();

      if (error) {
        throw error;
      }

      // Create default venue hours for all days of the week
      if (data && data[0]?.id) {
        const venueId = data[0].id;
        await createDefaultVenueHours(venueId);
      }

      // Explicitly invalidate venue queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['breweryVenues', breweryId] });
      queryClient.invalidateQueries({ queryKey: ['venueHours'] });
      
      toast.success('Venue added successfully');
      onVenueAdded();
      
      // Ensure body is interactive before closing
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding venue:', error);
      toast.error(error.message || 'Failed to add venue');
    } finally {
      setIsLoading(false);
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

export default AddVenueDialog;
