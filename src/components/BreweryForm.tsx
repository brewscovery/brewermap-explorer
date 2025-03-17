
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Form } from './ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { BreweryFormData } from '@/types/brewery';
import GeneralInfoSection from './brewery/form/GeneralInfoSection';
import WebsiteSection from './brewery/form/WebsiteSection';

interface BreweryFormProps {
  onSubmitSuccess: () => void;
}

const BreweryForm = ({ onSubmitSuccess }: BreweryFormProps) => {
  const form = useForm<BreweryFormData>();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: BreweryFormData) => {
    if (!user) {
      toast.error('You must be logged in to add a brewery');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert the brewery with all required fields
      const breweryData = {
        name: data.name,
        brewery_type: data.brewery_type || null,
        website_url: data.website_url || null,
        about: data.about || null,
        facebook_url: data.facebook_url || null,
        instagram_url: data.instagram_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newBrewery, error: breweryError } = await supabase
        .from('breweries')
        .insert(breweryData)
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
      form.reset();
      onSubmitSuccess();
    } catch (error: any) {
      console.error('Error adding brewery:', error);
      toast.error('Failed to add brewery');
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
          {isSubmitting ? 'Adding...' : 'Add Brewery'}
        </Button>
      </form>
    </Form>
  );
};

export default BreweryForm;
