
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';
import { TermsAndConditionsDialog } from '@/components/auth/TermsAndConditionsDialog';

const SettingsPage = () => {
  const [showTermsDialog, setShowTermsDialog] = useState(false);

  const handleTermsLinkClick = () => {
    setShowTermsDialog(true);
  };

  const handleTermsDialogClose = () => {
    // For settings page, we don't need to do anything special when terms are "accepted"
    // Just close the dialog
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <NotificationPreferences />
      
      {/* Terms and Conditions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Legal</CardTitle>
          <CardDescription>
            Review our terms and conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="link"
            onClick={handleTermsLinkClick}
            className="p-0 h-auto text-primary hover:underline"
          >
            Terms and Conditions
          </Button>
        </CardContent>
      </Card>
      
      {/* Placeholder for future settings sections */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account information and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Additional account settings will be available here in the future.
          </p>
        </CardContent>
      </Card>

      <TermsAndConditionsDialog
        open={showTermsDialog}
        onOpenChange={setShowTermsDialog}
        onAccept={handleTermsDialogClose}
      />
    </div>
  );
};

export default SettingsPage;
