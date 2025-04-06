
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Form } from './ui/form';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { BreweryFormData, Brewery } from '@/types/brewery';
import GeneralInfoSection from './brewery/form/GeneralInfoSection';
import WebsiteSection from './brewery/form/WebsiteSection';
import LogoUploadSection from './brewery/form/LogoUploadSection';

interface BreweryFormProps {
  onSubmitSuccess: () => void;
  initialData?: Brewery;
  isEditing?: boolean;
}

const BreweryForm = ({ onSubmitSuccess, initialData, isEditing }: BreweryFormProps) => {
  const form = useForm<BreweryFormData>({
    defaultValues: initialData ? {
      name: initialData.name,
      brewery_type: initialData.brewery_type || '',
      website_url: initialData.website_url || '',
      about: initialData.about || '',
      facebook_url: initialData.facebook_url || '',
      instagram_url: initialData.instagram_url || '',
      logo_url: initialData.logo_url || '',
    } : {
      name: '',
      brewery_type: '',
      website_url: '',
      about: '',
      facebook_url: '',
      instagram_url: '',
      logo_url: '',
    }
  });
  
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [breweryId, setBreweryId] = useState<string | undefined>(initialData?.id);

  // Update form when initialData changes (for editing mode)
  useEffect(() => {
    if (initialData && isEditing) {
      console.log('Updating form with initialData:', initialData);
      form.reset({
        name: initialData.name,
        brewery_type: initialData.brewery_type || '',
        website_url: initialData.website_url || '',
        about: initialData.about || '',
        facebook_url: initialData.facebook_url || '',
        instagram_url: initialData.instagram_url || '',
        logo_url: initialData.logo_url || '',
      });
      setBreweryId(initialData.id);
    }
  }, [initialData, isEditing, form]);

  const onSubmit = async (data: BreweryFormData) => {
    if (!user) {
      toast.error('You must be logged in to add or edit a brewery');
      return;
    }

    setIsSubmitting(true);
    console.log('Form submission started with data:', data);
    console.log('Current user ID:', user.id);

    try {
      const breweryData = {
        name: data.name,
        brewery_type: data.brewery_type || null,
        website_url: data.website_url || null,
        about: data.about || null,
        facebook_url: data.facebook_url || null,
        instagram_url: data.instagram_url || null,
        logo_url: data.logo_url || null,
        updated_at: new Date().toISOString()
      };
      console.log('Prepared brewery data for submission:', breweryData);

      if (isEditing && initialData) {
        console.log('Updating existing brewery with ID:', initialData.id);
        
        // Check brewery ownership first
        const { data: ownershipData, error: ownershipError } = await supabase
          .from('brewery_owners')
          .select('brewery_id')
          .eq('brewery_id', initialData.id)
          .eq('user_id', user.id);
          
        if (ownershipError) {
          console.error('Error checking brewery ownership:', ownershipError);
          throw new Error(`Ownership verification failed: ${ownershipError.message}`);
        }
        
        console.log('Ownership check result:', ownershipData);
        
        if (!ownershipData || ownershipData.length === 0) {
          console.error('User does not own this brewery. User ID:', user.id, 'Brewery ID:', initialData.id);
          throw new Error('You do not have permission to update this brewery');
        }
        
        // Update existing brewery
        const { data: updatedData, error: breweryError } = await supabase
          .from('breweries')
          .update(breweryData)
          .eq('id', initialData.id)
          .select();

        if (breweryError) {
          console.error('Error updating brewery:', breweryError);
          throw breweryError;
        }

        if (!updatedData || updatedData.length === 0) {
          console.error('No rows were updated in the database. This could be a permissions issue.');
          throw new Error('Failed to update brewery. No rows were affected.');
        }

        console.log('Brewery successfully updated:', updatedData);
        toast.success('Brewery updated successfully!');
      } else {
        console.log('Creating new brewery');
        // Insert a new brewery
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

        // Create the brewery ownership record
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
      onSubmitSuccess();
    } catch (error: any) {
      console.error('Error managing brewery:', error);
      toast.error(isEditing 
        ? `Failed to update brewery: ${error.message || 'Unknown error'}` 
        : `Failed to add brewery: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-220px)] pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <GeneralInfoSection form={form} />
          <WebsiteSection form={form} />
          <LogoUploadSection form={form} breweryId={breweryId} />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Adding...') 
              : (isEditing ? 'Update Brewery' : 'Add Brewery')}
          </Button>
        </form>
      </Form>
    </ScrollArea>
  );
};

export default BreweryForm;
