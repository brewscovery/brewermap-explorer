
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Brewery } from '@/types/brewery';
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

interface BreweryFormProps {
  onSubmitSuccess: () => void;
}

const BreweryForm = ({ onSubmitSuccess }: BreweryFormProps) => {
  const form = useForm<Omit<Brewery, 'id'>>();
  const { watch } = form;
  const { user } = useAuth();

  // Watch address fields for changes
  const street = watch('street');
  const city = watch('city');
  const state = watch('state');
  const postalCode = watch('postal_code');

  // Fetch coordinates when address fields change
  useEffect(() => {
    const fetchCoordinates = async () => {
      // Only proceed if all required fields are filled
      if (!street || !city || !state) return;

      try {
        const { data, error } = await supabase.functions.invoke('geocode', {
          body: {
            street,
            city,
            state,
            postalCode,
          },
        });

        if (error) throw error;

        if (data.latitude && data.longitude) {
          form.setValue('latitude', data.latitude);
          form.setValue('longitude', data.longitude);
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        toast.error('Failed to fetch coordinates');
      }
    };

    fetchCoordinates();
  }, [street, city, state, postalCode, form]);

  const onSubmit = async (data: Omit<Brewery, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to add a brewery');
      return;
    }

    try {
      // First, insert the brewery
      const { data: breweryData, error: breweryError } = await supabase
        .from('breweries')
        .insert([data])
        .select()
        .single();

      if (breweryError) throw breweryError;

      // Then, create the brewery ownership record
      const { error: ownershipError } = await supabase
        .from('brewery_owners')
        .insert([
          {
            user_id: user.id,
            brewery_id: breweryData.id
          }
        ]);

      if (ownershipError) throw ownershipError;

      toast.success('Brewery added successfully!');
      form.reset();
      onSubmitSuccess();
    } catch (error: any) {
      console.error('Error adding brewery:', error);
      toast.error('Failed to add brewery');
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
                <Input placeholder="Brewery name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street</FormLabel>
                <FormControl>
                  <Input placeholder="Street address" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="State" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="Postal code" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
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
                  <Input placeholder="Website URL" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Add Brewery
        </Button>
      </form>
    </Form>
  );
};

export default BreweryForm;
