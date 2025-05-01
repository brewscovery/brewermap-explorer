
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

import GeneralInfoSection from './GeneralInfoSection';
import WebsiteSection from './WebsiteSection';
import ContactInfoSection from './ContactInfoSection';
import LogoUploadSection from './logo';
import BreweryVerificationField from '@/components/admin/brewery/form/BreweryVerificationField';
import BreweryIndependentField from '@/components/admin/brewery/form/BreweryIndependentField';
import { brewerySchema } from '@/components/admin/brewery/form/types';
import type { Brewery } from '@/types/brewery';

// Export the schema and type for reuse
export const unifiedBrewerySchema = brewerySchema;
export type UnifiedBreweryFormValues = z.infer<typeof unifiedBrewerySchema>;

interface BreweryFormContentProps {
  initialData?: Partial<Brewery> & { id?: string; name?: string };
  onSubmit: (data: UnifiedBreweryFormValues) => void;
  isLoading: boolean;
  isAdminMode: boolean;
  breweryId?: string;
  isEditMode: boolean;
}

const BreweryFormContent = ({
  initialData,
  onSubmit,
  isLoading,
  isAdminMode,
  breweryId,
  isEditMode
}: BreweryFormContentProps) => {
  const form = useForm<UnifiedBreweryFormValues>({
    resolver: zodResolver(unifiedBrewerySchema),
    defaultValues: {
      name: initialData?.name || '',
      about: initialData?.about || null,
      website_url: initialData?.website_url || null,
      facebook_url: initialData?.facebook_url || null,
      instagram_url: initialData?.instagram_url || null,
      logo_url: initialData?.logo_url || null,
      is_verified: initialData?.is_verified || false,
      country: initialData?.country || 'Australia',
      is_independent: initialData?.is_independent || false,
    },
  });

  // Update form values when initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        about: initialData.about || null,
        website_url: initialData.website_url || null,
        facebook_url: initialData.facebook_url || null,
        instagram_url: initialData.instagram_url || null,
        logo_url: initialData.logo_url || null,
        is_verified: initialData.is_verified || false,
        country: initialData.country || 'Australia',
        is_independent: initialData.is_independent || false,
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <GeneralInfoSection form={form} />
        <WebsiteSection form={form} />
        
        {/* Show contact info only for new brewery creation by business users */}
        <ContactInfoSection 
          form={form} 
          showContactInfo={!isEditMode && !isAdminMode} 
        />
        
        {/* Show verification toggle only for admin users */}
        {isAdminMode && (
          <>
            <BreweryVerificationField form={form} />
            <BreweryIndependentField form={form} />
          </>
        )}
        
        {/* Show logo upload for everyone */}
        <LogoUploadSection form={form} breweryId={breweryId} />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading
            ? (isEditMode ? 'Updating...' : 'Adding...') 
            : (isEditMode ? 'Update Brewery' : 'Add Brewery')}
        </Button>
      </form>
    </Form>
  );
};

export default BreweryFormContent;
