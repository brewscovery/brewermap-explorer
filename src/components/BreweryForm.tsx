
import React from 'react';
import { Brewery, BreweryFormData } from '@/types/brewery';
import UnifiedBreweryForm from './brewery/UnifiedBreweryForm';

interface BreweryFormProps {
  onSubmitSuccess: () => void;
  initialData?: Brewery;
  isEditing?: boolean;
}

const BreweryForm = ({ onSubmitSuccess, initialData, isEditing }: BreweryFormProps) => {
  // This is now just a wrapper around the unified form for backward compatibility
  return (
    <UnifiedBreweryForm
      initialData={initialData}
      onSubmit={() => {}} // Not needed in regular user mode since it handles submission internally
      onSubmitSuccess={onSubmitSuccess}
      isAdminMode={false}
      breweryId={initialData?.id}
    />
  );
};

export default BreweryForm;
