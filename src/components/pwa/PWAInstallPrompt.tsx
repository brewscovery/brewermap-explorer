import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

interface PWAInstallPromptProps {
  onInstall: () => void;
  onClose: () => void;
  showInstallButton?: boolean;
}

export const PWAInstallPrompt = ({ onInstall, onClose, showInstallButton = true }: PWAInstallPromptProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AppLogo variant="full" className="max-w-48" />
          </div>
          <CardTitle>Install Brewscovery</CardTitle>
          <CardDescription>
            Get the best experience with our mobile app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <span className="text-sm">Quick access from your home screen</span>
            </div>
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-primary" />
              <span className="text-sm">Works offline when cached</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs">⚡</span>
              </div>
              <span className="text-sm">Fast, native-like experience</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {showInstallButton && (
              <Button onClick={onInstall} className="flex-1">
                Install App
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1">
              {showInstallButton ? 'Maybe Later' : 'Continue in Browser'}
            </Button>
          </div>
          
          {!showInstallButton && (
            <div className="text-xs text-center text-muted-foreground">
              Your device doesn't support app installation, but you can still use Brewscovery in your browser!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};