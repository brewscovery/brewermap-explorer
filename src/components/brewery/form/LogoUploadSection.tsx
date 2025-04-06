
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { BreweryFormData } from '@/types/brewery';
import { useAuth } from '@/contexts/AuthContext';

interface LogoUploadSectionProps {
  form: UseFormReturn<BreweryFormData>;
  breweryId?: string;
}

const LogoUploadSection = ({ form, breweryId }: LogoUploadSectionProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    // Set preview from form value
    const logoUrl = form.getValues('logo_url');
    if (logoUrl) {
      setPreviewUrl(logoUrl);
    }
  }, [form]);
  
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
        toast.error('Brewery ID is required to upload a logo');
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
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('brewery_logos')
        .upload(filePath, file, {
          upsert: true,
        });
        
      if (error) {
        console.error('Error uploading logo:', error);
        toast.error(`Error uploading logo: ${error.message}`);
        return;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('brewery_logos')
        .getPublicUrl(filePath);
        
      const publicUrl = publicUrlData.publicUrl;
      
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
                {previewUrl ? (
                  <div className="relative">
                    <Avatar className="w-24 h-24 border">
                      <AvatarImage src={previewUrl} alt="Brewery logo" />
                      <AvatarFallback>{form.getValues('name').substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handleRemoveLogo}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-md p-4 w-full flex flex-col items-center gap-2">
                    <div className="bg-muted rounded-full p-3">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Upload a logo for your brewery
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={uploading || !breweryId}
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {previewUrl ? 'Change Logo' : 'Upload Logo'}
                      </>
                    )}
                  </Button>
                  
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploading || !breweryId}
                  />
                  
                  <input
                    type="hidden"
                    {...field}
                  />
                </div>
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default LogoUploadSection;
