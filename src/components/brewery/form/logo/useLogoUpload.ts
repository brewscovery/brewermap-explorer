
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BreweryFormData } from '@/types/brewery';
import { useAuth } from '@/contexts/AuthContext';

export const useLogoUpload = (
  form: UseFormReturn<BreweryFormData>,
  breweryId?: string
) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    form.getValues('logo_url') || null
  );
  const { user } = useAuth();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      if (!user) {
        toast.error('You must be logged in to upload a logo');
        return;
      }
      
      if (!breweryId) {
        toast.error('Please save the brewery first before uploading a logo');
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${breweryId}/logo-${Date.now()}.${fileExt}`;
      const filePath = fileName;
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo file size must be less than 2MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Logo must be a valid image file (JPEG, PNG, GIF, SVG, WebP)');
        return;
      }
      
      setUploading(true);
      console.log('Starting upload process for file:', fileName);
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('brewery_logos')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
          contentType: file.type
        });
        
      if (error) {
        console.error('Error uploading logo:', error);
        
        // Provide more specific error messages based on error code
        if (error.message.includes('storage/unauthorized')) {
          toast.error('You do not have permission to upload files. Please check if you are logged in.');
        } else if (error.message.includes('storage/object_too_large')) {
          toast.error('File is too large. Maximum size is 2MB.');
        } else {
          toast.error(`Error uploading logo: ${error.message}`);
        }
        
        setUploading(false);
        return;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('brewery_logos')
        .getPublicUrl(filePath);
        
      const publicUrl = publicUrlData.publicUrl;
      console.log('Logo uploaded successfully, public URL:', publicUrl);
      
      // Update the form
      form.setValue('logo_url', publicUrl);
      setPreviewUrl(publicUrl);
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Error in logo upload:', error);
      toast.error(`Error uploading logo: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      // Clear the file input
      event.target.value = '';
    }
  };
  
  const handleRemoveLogo = () => {
    // Clear the form field
    form.setValue('logo_url', '');
    setPreviewUrl(null);
    toast.success('Logo removed');
  };

  return {
    previewUrl,
    uploading,
    handleUpload,
    handleRemoveLogo
  };
};
