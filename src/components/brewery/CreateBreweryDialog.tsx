
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BreweryForm from '@/components/BreweryForm';

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
        <BreweryForm onSubmitSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateBreweryDialog;
