
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { BreweryFormValues } from "./types";

interface BreweryVerificationFieldProps {
  form: UseFormReturn<BreweryFormValues>;
}

const BreweryVerificationField = ({ form }: BreweryVerificationFieldProps) => {
  return (
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
  );
};

export default BreweryVerificationField;
