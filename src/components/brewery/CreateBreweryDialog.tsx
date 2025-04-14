
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog-fixed'; // Changed from dialog to dialog-fixed
import UnifiedBreweryForm from '@/components/brewery/UnifiedBreweryForm';

interface CreateBreweryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateBreweryDialog = ({ 
  open, 
  onOpenChange,
  onSuccess 
}: CreateBreweryDialogProps) => {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Your Brewery</DialogTitle>
        </DialogHeader>
        
        <UnifiedBreweryForm 
          onSubmit={() => {}} // Not needed in regular user mode
          onSubmitSuccess={handleSuccess} 
          isAdminMode={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateBreweryDialog;
