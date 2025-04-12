
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import BreweryBasicInfoFields from './form/BreweryBasicInfoFields';
import BrewerySocialFields from './form/BrewerySocialFields';
import BreweryVerificationField from './form/BreweryVerificationField';
import BreweryFormActions from './form/BreweryFormActions';
import { brewerySchema, BreweryFormValues } from './form/types';
import type { Brewery } from '@/types/brewery';

// Make the initialData more flexible to accept either Brewery or BreweryData
interface AdminBreweryFormProps {
  initialData?: Partial<Brewery> & { id: string; name: string };
  onSubmit: (data: BreweryFormValues) => void;
  isLoading: boolean;
}

const AdminBreweryForm = ({ initialData, onSubmit, isLoading }: AdminBreweryFormProps) => {
  // Debugging
  useEffect(() => {
    if (initialData) {
      console.log('Form initialData:', initialData);
    }
  }, [initialData]);

  // Initialize form with the initial data or default values
  const form = useForm<BreweryFormValues>({
    resolver: zodResolver(brewerySchema),
    defaultValues: {
      name: initialData?.name || '',
      brewery_type: initialData?.brewery_type || null,
      about: initialData?.about || null,
      website_url: initialData?.website_url || null,
      facebook_url: initialData?.facebook_url || null,
      instagram_url: initialData?.instagram_url || null,
      logo_url: initialData?.logo_url || null,
      is_verified: initialData?.is_verified || false,
      country: initialData?.country || 'Australia',
    },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        brewery_type: initialData.brewery_type || null,
        about: initialData.about || null,
        website_url: initialData.website_url || null,
        facebook_url: initialData.facebook_url || null,
        instagram_url: initialData.instagram_url || null,
        logo_url: initialData.logo_url || null,
        is_verified: initialData.is_verified || false,
        country: initialData.country || 'Australia',
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: BreweryFormValues) => {
    console.log('Submitting form values:', values);
    onSubmit(values);
  };

  const isEditMode = !!initialData;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <BreweryBasicInfoFields form={form} />
        <BrewerySocialFields form={form} />
        <BreweryVerificationField form={form} />
        <BreweryFormActions isLoading={isLoading} isEditMode={isEditMode} />
      </form>
    </Form>
  );
};

export default AdminBreweryForm;
