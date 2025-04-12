
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

// Import components from both form implementations
import GeneralInfoSection from './form/GeneralInfoSection';
import WebsiteSection from './form/WebsiteSection';
import LogoUploadSection from './form/logo';
import BreweryVerificationField from '@/components/admin/brewery/form/BreweryVerificationField';
import { brewerySchema } from '@/components/admin/brewery/form/types';
import type { Brewery } from '@/types/brewery';

// Create a unified schema
const unifiedBrewerySchema = brewerySchema;
export type UnifiedBreweryFormValues = z.infer<typeof unifiedBrewerySchema>;

interface UnifiedBreweryFormProps {
  initialData?: Partial<Brewery> & { id?: string; name?: string };
  onSubmit: (data: UnifiedBreweryFormValues) => void;
  isLoading?: boolean;
  isAdminMode?: boolean;
  onSubmitSuccess?: () => void;
  breweryId?: string;
}

const UnifiedBreweryForm = ({ 
  initialData, 
  onSubmit, 
  isLoading = false,
  isAdminMode = false,
  onSubmitSuccess,
  breweryId: initialBreweryId
}: UnifiedBreweryFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(isLoading);
  const [breweryId, setBreweryId] = useState<string | undefined>(initialBreweryId || initialData?.id);
  const isEditMode = !!initialData?.id;

  // Initialize form with the initial data or default values
  const form = useForm<UnifiedBreweryFormValues>({
    resolver: zodResolver(unifiedBrewerySchema),
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
      
      if (initialData.id) {
        setBreweryId(initialData.id);
      }
    }
  }, [initialData, form]);

  // Handle the form submission 
  const handleFormSubmit = async (values: UnifiedBreweryFormValues) => {
    console.log('Submitting form values:', values);
    
    if (isAdminMode) {
      // For admin mode, simply pass the values to the provided onSubmit handler
      onSubmit(values);
      return;
    }
    
    // For regular user mode, handle Supabase operations directly
    if (!user) {
      toast.error('You must be logged in to add or edit a brewery');
      return;
    }

    setIsSubmitting(true);
    console.log('Regular user form submission started with data:', values);

    try {
      const breweryData = {
        name: values.name,
        brewery_type: values.brewery_type || null,
        website_url: values.website_url || null,
        about: values.about || null,
        facebook_url: values.facebook_url || null,
        instagram_url: values.instagram_url || null,
        logo_url: values.logo_url || null,
        country: values.country || 'Australia',
        updated_at: new Date().toISOString()
      };
      
      if (isEditMode && breweryId) {
        console.log('Updating existing brewery with ID:', breweryId);
        
        const { data: ownershipData, error: ownershipError } = await supabase
          .from('brewery_owners')
          .select('brewery_id')
          .eq('brewery_id', breweryId)
          .eq('user_id', user.id);
          
        if (ownershipError) {
          console.error('Error checking brewery ownership:', ownershipError);
          throw new Error(`Ownership verification failed: ${ownershipError.message}`);
        }
        
        if (!ownershipData || ownershipData.length === 0) {
          console.error('User does not own this brewery. User ID:', user.id, 'Brewery ID:', breweryId);
          throw new Error('You do not have permission to update this brewery');
        }
        
        const { data: updatedData, error: breweryError } = await supabase
          .from('breweries')
          .update(breweryData)
          .eq('id', breweryId)
          .select();

        if (breweryError) {
          console.error('Error updating brewery:', breweryError);
          throw breweryError;
        }

        console.log('Brewery successfully updated:', updatedData);
        toast.success('Brewery updated successfully!');
      } else {
        console.log('Creating new brewery');
        const { data: newBrewery, error: breweryError } = await supabase
          .from('breweries')
          .insert({ 
            ...breweryData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (breweryError) {
          console.error('Error creating brewery:', breweryError);
          throw breweryError;
        }

        console.log('New brewery created:', newBrewery);
        setBreweryId(newBrewery.id);

        const { data: ownershipData, error: ownershipError } = await supabase
          .from('brewery_owners')
          .insert({
            user_id: user.id,
            brewery_id: newBrewery.id
          })
          .select();

        if (ownershipError) {
          console.error('Error creating brewery ownership record:', ownershipError);
          throw ownershipError;
        }

        console.log('Brewery ownership record created:', ownershipData);
        toast.success('Brewery added successfully!');
      }
      
      form.reset();
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error('Error managing brewery:', error);
      toast.error(isEditMode 
        ? `Failed to update brewery: ${error.message || 'Unknown error'}` 
        : `Failed to add brewery: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fix the className issue by combining the styles correctly
  const scrollAreaClassName = isAdminMode 
    ? "h-full pr-4" 
    : "h-[calc(100vh-220px)] pr-4";

  return (
    <ScrollArea className={scrollAreaClassName}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <GeneralInfoSection form={form} />
          <WebsiteSection form={form} />
          
          {/* Show verification toggle only for admin users */}
          {isAdminMode && (
            <BreweryVerificationField form={form} />
          )}
          
          {/* Show logo upload for everyone */}
          <LogoUploadSection form={form} breweryId={breweryId} />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading
              ? (isEditMode ? 'Updating...' : 'Adding...') 
              : (isEditMode ? 'Update Brewery' : 'Add Brewery')}
          </Button>
        </form>
      </Form>
    </ScrollArea>
  );
};

export default UnifiedBreweryForm;
