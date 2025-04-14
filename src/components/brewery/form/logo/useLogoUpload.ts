
import { useState, useCallback, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedBreweryFormValues } from '../../UnifiedBreweryForm';

// Hook to handle logo upload functionality
export const useLogoUpload = (
  form: UseFormReturn<UnifiedBreweryFormValues>,
  breweryId?: string
) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Initialize with the current form value
  useEffect(() => {
    const logoUrl = form.getValues('logo_url');
    if (logoUrl) {
      console.log('Loading logo from URL:', logoUrl);
      setPreviewUrl(logoUrl);
    }
  }, [form]);

  // Generate a consistent public URL for a file
  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('brewery_logos')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  // Handle logo upload
  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!breweryId) {
      toast.error('Brewery must be saved before uploading a logo');
      return;
    }

    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      // Use EXACTLY the same filename pattern consistently
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `${breweryId}/${fileName}`;

      console.log('Uploading to path:', filePath);

      const { error: uploadError, data } = await supabase.storage
        .from('brewery_logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful, data:', data);

      // Get public URL using our helper function
      const publicUrl = getPublicUrl(filePath);
      console.log('Generated public URL:', publicUrl);

      // Update logo_url in form
      form.setValue('logo_url', publicUrl);
      setPreviewUrl(publicUrl);

      toast.success('Logo uploaded successfully!');
    } catch (error: any) {
      toast.error(`Error uploading logo: ${error.message}`);
      console.error('Error uploading logo:', error);
    } finally {
      setUploading(false);
      // Reset the input
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [breweryId, form]);

  // Handle logo removal
  const handleRemoveLogo = useCallback(() => {
    // Update form value
    form.setValue('logo_url', null);
    setPreviewUrl(null);
    toast.success('Logo removed');
  }, [form]);

  return {
    previewUrl,
    uploading,
    handleUpload,
    handleRemoveLogo
  };
};
