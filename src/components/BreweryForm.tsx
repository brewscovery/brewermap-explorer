
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from './ui/form';
import { Input } from './ui/input';
import { useAuth } from '@/contexts/AuthContext';

interface BreweryFormData {
  name: string;
  brewery_type: string;
  website_url: string;
  about: string;
  facebook_url: string;
  instagram_url: string;
}

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Brewery name" {...field} required />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brewery_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Input placeholder="micro, brewpub, etc." {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About</FormLabel>
              <FormControl>
                <Input placeholder="Brief description of your brewery" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="facebook_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://facebook.com/yourbrewery" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instagram_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://instagram.com/yourbrewery" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Brewery'}
        </Button>
      </form>
    </Form>
  );
};

export default BreweryForm;
