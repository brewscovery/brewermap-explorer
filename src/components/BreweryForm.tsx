
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Form } from './ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { BreweryFormData, Brewery } from '@/types/brewery';
import GeneralInfoSection from './brewery/form/GeneralInfoSection';
import WebsiteSection from './brewery/form/WebsiteSection';

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
    } : undefined
  });
  
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when initialData changes (for editing mode)
  useEffect(() => {
    if (initialData && isEditing) {
      form.reset({
        name: initialData.name,
        brewery_type: initialData.brewery_type || '',
        website_url: initialData.website_url || '',
        about: initialData.about || '',
        facebook_url: initialData.facebook_url || '',
        instagram_url: initialData.instagram_url || '',
      });
    }
  }, [initialData, isEditing, form]);

  const onSubmit = async (data: BreweryFormData) => {
    if (!user) {
      toast.error('You must be logged in to add or edit a brewery');
      return;
    }

    setIsSubmitting(true);

    try {
      const breweryData = {
        name: data.name,
        brewery_type: data.brewery_type || null,
        website_url: data.website_url || null,
        about: data.about || null,
        facebook_url: data.facebook_url || null,
        instagram_url: data.instagram_url || null,
        updated_at: new Date().toISOString()
      };

      if (isEditing && initialData) {
        // Update existing brewery
        const { error: breweryError } = await supabase
          .from('breweries')
          .update(breweryData)
          .eq('id', initialData.id);

        if (breweryError) throw breweryError;

        toast.success('Brewery updated successfully!');
      } else {
        // Insert a new brewery
        const { data: newBrewery, error: breweryError } = await supabase
          .from('breweries')
          .insert({
            ...breweryData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (breweryError) throw breweryError;

        // Create the brewery ownership record
        const { error: ownershipError } = await supabase
          .from('brewery_owners')
          .insert({
            user_id: user.id,
            brewery_id: newBrewery.id
          });

        if (ownershipError) throw ownershipError;

        toast.success('Brewery added successfully!');
      }

      form.reset();
      onSubmitSuccess();
    } catch (error: any) {
      console.error('Error managing brewery:', error);
      toast.error(isEditing ? 'Failed to update brewery' : 'Failed to add brewery');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <GeneralInfoSection form={form} />
        <WebsiteSection form={form} />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting 
            ? (isEditing ? 'Updating...' : 'Adding...') 
            : (isEditing ? 'Update Brewery' : 'Add Brewery')}
        </Button>
      </form>
    </Form>
  );
};

export default BreweryForm;
