
import React from 'react';
import type { BreweryFormValues } from './form/types';
import UnifiedBreweryForm from '@/components/brewery/UnifiedBreweryForm';
import type { Brewery } from '@/types/brewery';

// Make the initialData more flexible to accept either Brewery or BreweryData
interface AdminBreweryFormProps {
  initialData?: Partial<Brewery> & { id: string; name: string };
  onSubmit: (data: BreweryFormValues) => void;
  isLoading: boolean;
}

const AdminBreweryForm = ({ initialData, onSubmit, isLoading }: AdminBreweryFormProps) => {
  // This is now just a wrapper around the unified form for backward compatibility
  return (
    <UnifiedBreweryForm
      initialData={initialData}
      onSubmit={onSubmit}
      isLoading={isLoading}
      isAdminMode={true}
    />
  );
};

export default AdminBreweryForm;
