import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  showAcceptanceText?: boolean;
}

export const PrivacyPolicyDialog = ({ 
  open, 
  onOpenChange, 
  onAccept,
  showAcceptanceText = true
}: PrivacyPolicyDialogProps) => {
  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          {showAcceptanceText && (
            <DialogDescription>
              Please read and accept our privacy policy to continue.
            </DialogDescription>
          )}
        </DialogHeader>
        
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              [Privacy policy content will be added here later]
            </p>
            <p>
              We are committed to protecting your privacy and personal information.
              This privacy policy explains how we collect, use, and protect your data.
            </p>
            <p>
              <strong>Information We Collect:</strong> We collect information you provide directly to us, 
              such as when you create an account, use our services, or contact us for support. 
              This may include your name, email address, and usage data.
            </p>
            <p>
              <strong>How We Use Your Information:</strong> We use the information we collect to provide, 
              maintain, and improve our services, communicate with you, and ensure the security of our platform.
            </p>
            <p>
              <strong>Data Sharing:</strong> We do not sell, trade, or otherwise transfer your personal 
              information to third parties without your consent, except as described in this policy or 
              as required by law.
            </p>
            <p>
              <strong>Data Security:</strong> We implement appropriate technical and organizational measures 
              to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p>
              <strong>Your Rights:</strong> You have the right to access, update, or delete your personal 
              information. You may also opt out of certain communications from us.
            </p>
            <p>
              By using our services, you consent to the collection and use of your information as described 
              in this privacy policy. We may update this policy from time to time, and we will notify you 
              of any material changes.
            </p>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={handleAccept} className="w-full">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};