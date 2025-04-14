import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { UnifiedBreweryFormValues } from '../BreweryFormContent';

interface WebsiteSectionProps {
  form: UseFormReturn<UnifiedBreweryFormValues>;
}

const WebsiteSection = ({ form }: WebsiteSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Website & Online Presence</h3>
      
      <FormField
        control={form.control}
        name="website_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website URL</FormLabel>
            <FormControl>
              <Input placeholder="https://example.com" {...field} value={field.value || ''} />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="facebook_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facebook URL</FormLabel>
              <FormControl>
                <Input placeholder="https://facebook.com/yourbrewery" {...field} value={field.value || ''} />
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
                <Input placeholder="https://instagram.com/yourbrewery" {...field} value={field.value || ''} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default WebsiteSection;
