import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePWADetection } from '@/hooks/usePWADetection';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Venue } from '@/types/venue';

const QrRedirectHandler = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, userType, loading: authLoading } = useAuth();
  const { isPWA, isInstallable, promptInstall } = usePWADetection();
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [qrType, setQrType] = useState<'venue' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);

  // Check QR code type and fetch data
  useEffect(() => {
    const getQrCodeData = async () => {
      if (!token) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        // First check if it's an admin QR code
        const { data: adminData, error: adminError } = await supabase
          .from('admin_qr_codes')
          .select('*')
          .eq('token', token)
          .eq('is_active', true)
          .single();

        if (adminData && !adminError) {
          setQrType('admin');
          setIsLoading(false);
          return;
        }

        // If not admin, check venue QR codes
        const { data: qrData, error: qrError } = await supabase
          .from('venue_qr_codes')
          .select('venue_id')
          .eq('token', token)
          .eq('is_active', true)
          .single();

        if (qrError || !qrData) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        // Get venue details
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('*')
          .eq('id', qrData.venue_id)
          .single();

        if (venueError || !venueData) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setQrType('venue');
        setVenue(venueData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error processing QR code:', error);
        toast.error('Could not process the QR code');
        setNotFound(true);
        setIsLoading(false);
      }
    };

    getQrCodeData();
  }, [token]);

  // Handle redirect logic after data is loaded
  useEffect(() => {
    if (isLoading || authLoading) return;

    // Show PWA install prompt if not in PWA and on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (!isPWA && isMobile) {
      setShowPWAPrompt(true);
      return;
    }

    // If already in PWA or not mobile, proceed with normal redirect
    handleRedirect();
  }, [isLoading, authLoading, isPWA, qrType, venue, user]);

  const handleRedirect = () => {
    if (qrType === 'admin') {
      // Admin QR code - redirect to login if not authenticated
      if (!user) {
        navigate('/auth');
      } else {
        navigate('/');
      }
      return;
    }

    if (qrType === 'venue' && venue) {
      // Venue QR code logic
      if (!user) {
        // Store venue ID for after login
        sessionStorage.setItem('qr_checkin_venue_id', venue.id);
        navigate('/auth');
        return;
      }

      if (userType === 'business') {
        toast.error('Check-in functionality is not available for business users');
        navigate('/');
        return;
      }

      // Redirect to venue with check-in dialog
      navigate(`/?venueId=${venue.id}&action=check-in`);
    }
  };

  const handlePWAInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowPWAPrompt(false);
      // Give time for PWA to load before redirecting
      setTimeout(() => handleRedirect(), 1000);
    } else {
      // If install failed or was cancelled, continue to browser
      setShowPWAPrompt(false);
      handleRedirect();
    }
  };

  const handlePWAClose = () => {
    setShowPWAPrompt(false);
    // Don't automatically redirect to website - user chose not to install PWA
    // Instead, show a message or go to homepage without the specific action
    if (qrType === 'venue') {
      navigate('/');
    } else {
      handleRedirect();
    }
  };

  // Show PWA install prompt
  if (showPWAPrompt) {
    return (
      <PWAInstallPrompt
        onInstall={handlePWAInstall}
        onClose={handlePWAClose}
        showInstallButton={isInstallable}
      />
    );
  }

  // Show loading state
  if (isLoading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-xl font-semibold">
          {qrType === 'venue' ? 'Processing Check-In...' : 'Loading...'}
        </h1>
        <p className="text-muted-foreground mt-2">Please wait while we prepare your experience</p>
      </div>
    );
  }

  // Show error for invalid QR codes
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="bg-destructive/10 rounded-full p-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold">Invalid QR Code</h1>
        <p className="text-muted-foreground mt-2 text-center">
          This QR code is invalid or has expired.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  return <div className="h-screen flex items-center justify-center">Redirecting...</div>;
};

export default QrRedirectHandler;