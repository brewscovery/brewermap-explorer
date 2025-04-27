
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface RequiredFieldLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
  children: React.ReactNode;
  required?: boolean;
}

export function RequiredFieldLabel({ children, className, required = false, ...props }: RequiredFieldLabelProps) {
  return (
    <Label className={cn("flex items-center gap-1", className)} {...props}>
      {children}
      {required && <span className="text-destructive">*</span>}
    </Label>
  );
}
