
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog-fixed';
import { VenueForm } from '@/components/brewery/venue-form/VenueForm';
import type { AddressSuggestion } from '@/types/address';

interface AdminVenueAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breweryName: string;
  formData: any;
  addressInput: string;
  isFormLoading: boolean;
  setAddressInput: (value: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddressChange: (suggestion: AddressSuggestion | null) => void;
  handleVenueSubmit: (e: React.FormEvent) => Promise<void>;
  isPending: boolean;
}

export const AdminVenueAddDialog = ({
  open,
  onOpenChange,
  breweryName,
  formData,
  addressInput,
  isFormLoading,
  setAddressInput,
  handleChange,
  handleAddressChange,
  handleVenueSubmit,
  isPending
}: AdminVenueAddDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Venue</DialogTitle>
          <DialogDescription>
            Create a new venue for {breweryName}
          </DialogDescription>
        </DialogHeader>
        
        <VenueForm
          formData={formData}
          addressInput={addressInput}
          isSubmitting={isFormLoading || isPending}
          submitLabel="Create Venue"
          handleSubmit={handleVenueSubmit}
          handleChange={handleChange}
          handleAddressChange={handleAddressChange}
          setAddressInput={setAddressInput}
          onCancel={() => {
            onOpenChange(false);
            
            // Ensure body is interactive when canceling
            document.body.style.pointerEvents = '';
            document.body.style.overflow = '';
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
