
import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const claimFormSchema = z.object({
  contact_email: z.string().email("Please enter a valid email address"),
  contact_phone: z.string().min(1, "Please enter a phone number"),
  position: z.string().min(1, "Please enter your position at the brewery"),
});

type ClaimFormValues = z.infer<typeof claimFormSchema>;

interface BreweryClaimFormProps {
  breweryId: string;
  breweryName: string;
  onSuccess: () => void;
}

const BreweryClaimForm = ({ breweryId, breweryName, onSuccess }: BreweryClaimFormProps) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          You are claiming ownership of <span className="font-medium text-foreground">{breweryName}</span>. 
          Please provide your contact information for verification.
        </div>

        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email</FormLabel>
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
              <FormLabel>Contact Phone</FormLabel>
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
              <FormLabel>Your Position</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Owner, Manager, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Claim Request'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default BreweryClaimForm;
