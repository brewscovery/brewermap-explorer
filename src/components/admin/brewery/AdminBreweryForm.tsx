
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Brewery } from '@/types/brewery';

// Schema for brewery validation
const brewerySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  brewery_type: z.string().optional().nullable(),
  about: z.string().optional().nullable(),
  website_url: z.string().url('Must be a valid URL').optional().nullable(),
  facebook_url: z.string().url('Must be a valid URL').optional().nullable(),
  instagram_url: z.string().url('Must be a valid URL').optional().nullable(),
  logo_url: z.string().url('Must be a valid URL').optional().nullable(),
  is_verified: z.boolean().default(false),
  country: z.string().optional().nullable(),
});

type BreweryFormValues = z.infer<typeof brewerySchema>;

// Make the initialData more flexible to accept either Brewery or BreweryData
interface AdminBreweryFormProps {
  initialData?: Partial<Brewery> & { id: string; name: string };
  onSubmit: (data: BreweryFormValues) => void;
  isLoading: boolean;
}

const breweryTypes = [
  { value: 'micro', label: 'Micro' },
  { value: 'nano', label: 'Nano' },
  { value: 'regional', label: 'Regional' },
  { value: 'brewpub', label: 'Brewpub' },
  { value: 'large', label: 'Large' },
  { value: 'planning', label: 'Planning' },
  { value: 'bar', label: 'Bar' },
  { value: 'contract', label: 'Contract' },
  { value: 'proprietor', label: 'Proprietor' },
  { value: 'closed', label: 'Closed' },
];

// Common countries for breweries
const commonCountries = [
  { value: 'Australia', label: 'Australia' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Belgium', label: 'Belgium' },
  { value: 'New Zealand', label: 'New Zealand' },
];

const AdminBreweryForm = ({ initialData, onSubmit, isLoading }: AdminBreweryFormProps) => {
  // Debugging
  useEffect(() => {
    if (initialData) {
      console.log('Form initialData:', initialData);
    }
  }, [initialData]);

  // Initialize form with the initial data or default values
  const form = useForm<BreweryFormValues>({
    resolver: zodResolver(brewerySchema),
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
    }
  }, [initialData, form]);

  const handleSubmit = (values: BreweryFormValues) => {
    console.log('Submitting form values:', values);
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brewery Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter brewery name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brewery_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brewery Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brewery type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {breweryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {commonCountries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
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
                <Textarea
                  placeholder="Enter brewery description"
                  className="min-h-[120px]"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="website_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/logo.png" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="facebook_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://facebook.com/brewery" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
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
                  <Input placeholder="https://instagram.com/brewery" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_verified"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Verified Status</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Mark this brewery as verified
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : initialData ? 'Update Brewery' : 'Create Brewery'}
        </Button>
      </form>
    </Form>
  );
};

export default AdminBreweryForm;
