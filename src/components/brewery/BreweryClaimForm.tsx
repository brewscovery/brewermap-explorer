import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Venue } from '@/types/venue';
import { RequiredFieldLabel } from "@/components/ui/required-field-label";

const claimFormSchema = z.object({
  contact_email: z.string().email("Please enter a valid email address"),
  contact_phone: z.string().min(1, "Please enter a phone number"),
  position: z.string().min(1, "Please enter your position at the brewery"),
});

type ClaimFormValues = z.infer<typeof claimFormSchema>;

interface BreweryClaimFormProps {
  breweryId: string;
  breweryName: string;
  breweryCountry: string | null;
  venues: Venue[];
  onSuccess: () => void;
  onCancel?: () => void;
}

const formatVenueAddress = (venue: Venue) => {
  const parts = [
    venue.street,
    venue.city,
    venue.state,
    venue.postal_code
  ].filter(Boolean);
  return parts.join(', ');
};

const BreweryClaimForm = ({ 
  breweryId, 
  breweryName,
  breweryCountry,
  venues,
  onSuccess, 
  onCancel 
}: BreweryClaimFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      contact_email: "",
      contact_phone: "",
      position: "",
    },
  });

  const onSubmit = async (values: ClaimFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('brewery_claims')
        .insert({
          brewery_id: breweryId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          contact_email: values.contact_email,
          contact_phone: values.contact_phone,
          admin_notes: `Position: ${values.position}`,
        });

      if (error) throw error;

      toast.success("Claim request submitted successfully");
      onSuccess();
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error("Failed to submit claim request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const venueText = venues.length === 1 ? 'venue' : 'venues';
  const addressText = venues.length > 1 ? 'addresses' : 'address';
  const venuesList = venues.map(formatVenueAddress).join('; ');
  const locationInfo = `${breweryCountry || 'Unknown country'}. This brewery has a total of ${venues.length} ${venueText} associated with the brewery with the following ${addressText}:`;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          You are claiming ownership of <span className="font-medium text-foreground">{breweryName}</span>, {locationInfo} <span className="font-medium text-foreground">{venuesList}</span>. 
          Please provide your contact information for verification.
        </div>

        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <RequiredFieldLabel required>Contact Email</RequiredFieldLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_phone"
          render={({ field }) => (
            <FormItem>
              <RequiredFieldLabel required>Contact Phone</RequiredFieldLabel>
              <FormControl>
                <Input placeholder="Your phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <RequiredFieldLabel required>Your Position</RequiredFieldLabel>
              <FormControl>
                <Input placeholder="e.g. Owner, Manager, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Claim Request'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BreweryClaimForm;
