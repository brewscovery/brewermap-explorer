import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, RefreshCw, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import QRCode from 'qrcode.react';

export const AdminQrCodeGenerator = () => {
  const { user } = useAuth();
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const baseUrl = window.location.origin;
  
  // Fetch existing QR code on mount
  useEffect(() => {
    fetchQrCode();
  }, []);
  
  const fetchQrCode = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('admin_qr_codes')
        .select('token')
        .eq('qr_type', 'pwa_install')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }
      
      if (data?.token) {
        const qrUrl = `${baseUrl}/qr/${data.token}`;
        setQrValue(qrUrl);
      }
    } catch (error) {
      console.error('Error fetching admin QR code:', error);
      toast.error('Failed to load QR code');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateQrCode = async () => {
    try {
      setIsGenerating(true);
      
      // Deactivate existing QR codes
      await supabase
        .from('admin_qr_codes')
        .update({ is_active: false })
        .eq('qr_type', 'pwa_install')
        .eq('is_active', true);
      
      // Generate a new token
      const token = crypto.randomUUID();
      
      // Store the new token in the database
      const { error } = await supabase
        .from('admin_qr_codes')
        .insert({
          token: token,
          qr_type: 'pwa_install',
          created_by: user?.id,
          is_active: true
        });
      
      if (error) throw error;
      
      // Create the QR URL
      const qrUrl = `${baseUrl}/qr/${token}`;
      setQrValue(qrUrl);
      
      toast.success('PWA QR code generated successfully');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const downloadQrCode = () => {
    const canvas = document.getElementById('admin-qr-code') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `brewscovery-pwa-install-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>PWA Install QR Code</CardTitle>
        <CardDescription>
          Generate a QR code that prompts users to install the Brewscovery PWA on their mobile devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : qrValue ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-md">
              <QRCode 
                id="admin-qr-code"
                value={qrValue}
                size={250}
                level="H"
                includeMargin={true}
                renderAs="canvas"
              />
            </div>
            
            <div className="text-sm text-center text-muted-foreground">
              <p>When scanned on mobile devices, this QR code will prompt users to install the Brewscovery PWA.</p>
              <p className="mt-1">If the app is already installed, it will open the app on the login screen.</p>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={downloadQrCode}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Download QR Code
              </Button>
              
              <Button
                variant="outline"
                onClick={generateQrCode}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} />
                Generate New Code
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="rounded-full bg-muted p-3">
              <QrCode size={32} className="text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">No PWA QR Code Generated</h3>
              <p className="text-sm text-muted-foreground">
                Create a QR code that prompts users to install the Brewscovery PWA
              </p>
            </div>
            <Button 
              onClick={generateQrCode} 
              disabled={isGenerating}
              className="mt-4"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate PWA QR Code'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};