
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Phone } from "lucide-react";
import { UnifiedBreweryFormValues } from './BreweryFormContent';

interface ContactInfoSectionProps {
  form: UseFormReturn<UnifiedBreweryFormValues>;
  showContactInfo: boolean;
}

const ContactInfoSection = ({ form, showContactInfo }: ContactInfoSectionProps) => {
  if (!showContactInfo) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Contact Information</h3>
      
      <FormField
        control={form.control}
        name="contact_phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <div className="relative">
                <div className="absolute left-2 top-2.5 text-muted-foreground">
                  <Phone size={18} />
                </div>
                <Input 
                  placeholder="(03) 9123 4567"
                  className="pl-8"
                  {...field}
                  value={field.value || ''}
                />
              </div>
            </FormControl>
            <FormDescription>
              This number will only be used for the brewery verification process and won't be displayed publicly.
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
};

export default ContactInfoSection;
