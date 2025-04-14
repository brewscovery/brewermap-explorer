
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

  // Update the brewery logo_url in the database
  const updateBreweryLogoInDatabase = async (publicUrl: string) => {
    if (!breweryId) return;
    
    console.log('Updating brewery logo in database:', publicUrl);
    
    const { error } = await supabase
      .from('breweries')
      .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', breweryId);
    
    if (error) {
      console.error('Error updating brewery logo in database:', error);
      toast.error('Logo uploaded but failed to update brewery record');
      return false;
    }
    
    console.log('Brewery logo updated in database successfully');
    return true;
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

      // Immediately update the brewery record in the database
      const updated = await updateBreweryLogoInDatabase(publicUrl);
      
      if (updated) {
        toast.success('Logo uploaded and brewery updated successfully!');
      } else {
        toast.success('Logo uploaded successfully! Save the form to update the brewery.');
      }
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
  const handleRemoveLogo = useCallback(async () => {
    // Update form value
    form.setValue('logo_url', null);
    setPreviewUrl(null);
    
    // Update the brewery in the database if we have a breweryId
    if (breweryId) {
      const { error } = await supabase
        .from('breweries')
        .update({ logo_url: null, updated_at: new Date().toISOString() })
        .eq('id', breweryId);
      
      if (error) {
        console.error('Error removing logo from database:', error);
        toast.error('Failed to remove logo from brewery record');
      } else {
        toast.success('Logo removed successfully');
      }
    } else {
      toast.success('Logo removed');
    }
  }, [form, breweryId]);

  return {
    previewUrl,
    uploading,
    handleUpload,
    handleRemoveLogo
  };
};
