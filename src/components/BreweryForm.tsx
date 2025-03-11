
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Brewery } from '@/types/brewery';
import type { Venue } from '@/types/venue';
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

interface VenueFormData {
  name: string;
  brewery_type: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  website_url: string;
  latitude: string;
  longitude: string;
}

interface BreweryFormProps {
  onSubmitSuccess: () => void;
}

const BreweryForm = ({ onSubmitSuccess }: BreweryFormProps) => {
  const form = useForm<VenueFormData>();
  const { watch, setValue } = form;
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watch address fields for changes
  const street = watch('street');
  const city = watch('city');
  const state = watch('state');
  const postalCode = watch('postal_code');

  // Geocode the address when all required fields are filled
  const handleGeocodeAddress = async () => {
    // Only proceed if all required fields are filled
    if (!street || !city || !state) {
      return;
    }

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
        setValue('latitude', data.latitude);
        setValue('longitude', data.longitude);
        toast.success('Address geocoded successfully');
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      toast.error('Failed to fetch coordinates');
    }
  };

  const onSubmit = async (data: VenueFormData) => {
    if (!user) {
      toast.error('You must be logged in to add a brewery');
      return;
    }

    setIsSubmitting(true);

    try {
      // First, insert the brewery with minimal data
      const breweryData = {
        name: data.name,
        brewery_type: data.brewery_type || null,
        website_url: data.website_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newBrewery, error: breweryError } = await supabase
        .from('breweries')
        .insert(breweryData)
        .select()
        .single();

      if (breweryError) throw breweryError;

      // Then, create the venue with the brewery ID and location details
      const venueData = {
        brewery_id: newBrewery.id,
        name: data.name,
        street: data.street || null,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code || null,
        phone: data.phone || null,
        website_url: data.website_url || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null
      };

      const { error: venueError } = await supabase
        .from('venues')
        .insert(venueData);

      if (venueError) throw venueError;

      // Create the brewery ownership record
      const { error: ownershipError } = await supabase
        .from('brewery_owners')
        .insert({
          user_id: user.id,
          brewery_id: newBrewery.id
        });

      if (ownershipError) throw ownershipError;

      toast.success('Brewery and venue added successfully!');
      form.reset();
      onSubmitSuccess();
    } catch (error: any) {
      console.error('Error adding brewery:', error);
      toast.error('Failed to add brewery and venue');
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

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={handleGeocodeAddress} disabled={!street || !city || !state}>
            Get Coordinates
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Brewery'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BreweryForm;
