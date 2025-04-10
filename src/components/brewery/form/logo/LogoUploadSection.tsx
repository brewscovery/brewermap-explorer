
import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BreweryFormData } from '@/types/brewery';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useLogoUpload } from './useLogoUpload';
import { LogoPreview } from './LogoPreview';
import { LogoUploadButton } from './LogoUploadButton';

interface LogoUploadSectionProps {
  form: UseFormReturn<BreweryFormData>;
  breweryId?: string;
}

const LogoUploadSection = ({ form, breweryId }: LogoUploadSectionProps) => {
  const { 
    previewUrl, 
    uploading, 
    handleUpload, 
    handleRemoveLogo 
  } = useLogoUpload(form, breweryId);
  
  useEffect(() => {
    // Set preview from form value
    const logoUrl = form.getValues('logo_url');
    if (logoUrl) {
      console.log('Setting logo preview from form value:', logoUrl);
    }
  }, [form]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Brewery Logo</h3>
      
      <FormField
        control={form.control}
        name="logo_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Logo</FormLabel>
            <FormControl>
              <div className="flex flex-col items-center gap-4">
                <LogoPreview 
                  previewUrl={previewUrl} 
                  breweryName={form.getValues('name')}
                  onRemove={handleRemoveLogo}
                />
                
                <LogoUploadButton 
                  uploading={uploading}
                  breweryId={breweryId}
                  hasLogo={!!previewUrl}
                  onUpload={handleUpload}
                />
                
                <input
                  type="hidden"
                  {...field}
                />
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default LogoUploadSection;
