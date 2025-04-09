
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AdminBreweryForm from './AdminBreweryForm';
import { useCreateBrewery, useUpdateBrewery } from '@/hooks/useAdminBreweries';
import type { Brewery } from '@/types/brewery';
import type { BreweryData } from '@/hooks/useAdminData';

// Create a union type that accepts either Brewery or BreweryData
type BreweryInput = Partial<Brewery> & {
  id: string;
  name: string;
  is_verified?: boolean | null;
  brewery_type?: string | null;
  website_url?: string | null;
};

interface AdminBreweryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brewery?: BreweryInput;
  mode: 'create' | 'edit';
}

const AdminBreweryDialog = ({ 
  open, 
  onOpenChange, 
  brewery, 
  mode 
}: AdminBreweryDialogProps) => {
  const createBrewery = useCreateBrewery();
  const updateBrewery = useUpdateBrewery();
  
  // Only proceed with edit operations if we have a valid brewery with an ID
  const isValidEditMode = mode === 'edit' && brewery && brewery.id;
  
  // DEBUG LOGGING for component lifecycle
  useEffect(() => {
    console.log('DEBUG: AdminBreweryDialog mounted with mode:', mode, 'and brewery ID:', brewery?.id);
    return () => {
      console.log('DEBUG: AdminBreweryDialog unmounted - mode was:', mode, 'brewery ID was:', brewery?.id);
    };
  }, []);
  
  // DEBUG LOGGING for dialog open state
  useEffect(() => {
    console.log('DEBUG: AdminBreweryDialog open state changed to:', open, 'for brewery ID:', brewery?.id);
  }, [open, brewery?.id]);
  
  // Reset mutation state when dialog is closed
  useEffect(() => {
    if (!open) {
      console.log('DEBUG: AdminBreweryDialog - dialog closed, resetting state');
      // Reset any local state if needed
    }
  }, [open]);
  
  const handleSubmit = async (formData: any) => {
    console.log('DEBUG: AdminBreweryDialog handleSubmit called with mode:', mode);
    try {
      if (mode === 'create') {
        console.log('DEBUG: Creating new brewery with data:', formData);
        await createBrewery.mutateAsync(formData);
        console.log('DEBUG: Brewery created successfully, closing dialog');
        onOpenChange(false);
      } else if (isValidEditMode) {
        console.log('DEBUG: Updating brewery', brewery.id, 'with data:', formData);
        await updateBrewery.mutateAsync({
          breweryId: brewery.id,
          breweryData: formData
        });
        console.log('DEBUG: Brewery updated successfully, closing dialog');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('DEBUG: Error submitting brewery:', error);
    }
  };
  
  const isLoading = createBrewery.isPending || updateBrewery.isPending;
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpenState) => {
        console.log('DEBUG: Dialog onOpenChange called with new state:', newOpenState, 'for brewery ID:', brewery?.id);
        onOpenChange(newOpenState);
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Brewery' : 'Edit Brewery'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new brewery in the system.' 
              : 'Make changes to the brewery details.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <AdminBreweryForm
            initialData={brewery}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBreweryDialog;
