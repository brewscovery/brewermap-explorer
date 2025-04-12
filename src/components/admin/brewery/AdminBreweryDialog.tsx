
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog-fixed'; // Use fixed dialog
import AdminBreweryForm from './AdminBreweryForm';
import { useCreateBrewery, useUpdateBrewery } from '@/hooks/useAdminBreweries';
import type { Brewery } from '@/types/brewery';
import type { BreweryData } from '@/types/admin';
import type { BreweryFormValues } from './form/types';
import { ScrollArea } from '@/components/ui/scroll-area';

// Create a union type that accepts either Brewery or BreweryData
type BreweryInput = Partial<Brewery> & {
  id: string;
  name: string;
  is_verified?: boolean | null;
  brewery_type?: string | null;
  website_url?: string | null;
  about?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  logo_url?: string | null;
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
  
  // For debugging
  useEffect(() => {
    if (isValidEditMode) {
      console.log('Editing brewery with data:', brewery);
    }
  }, [brewery, isValidEditMode]);
  
  // Reset mutation state when dialog is closed
  useEffect(() => {
    if (!open) {
      // Reset any local state if needed
      
      // Make sure body is interactive
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    }
  }, [open]);
  
  const handleSubmit = async (formData: BreweryFormValues) => {
    try {
      if (mode === 'create') {
        await createBrewery.mutateAsync(formData);
        onOpenChange(false);
      } else if (isValidEditMode) {
        console.log('Submitting brewery update with data:', formData);
        await updateBrewery.mutateAsync({
          breweryId: brewery.id,
          breweryData: formData
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error submitting brewery:', error);
    }
  };
  
  const isLoading = createBrewery.isPending || updateBrewery.isPending;
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpenState) => {
        // Extra cleanup when closing
        if (!newOpenState) {
          document.body.style.pointerEvents = '';
          document.body.style.overflow = '';
        }
        
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
        
        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
          <div className="py-4">
            <AdminBreweryForm
              initialData={brewery}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBreweryDialog;
