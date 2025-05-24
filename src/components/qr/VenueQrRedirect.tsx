
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Venue } from '@/types/venue';

const VenueQrRedirect = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, userType, loading: authLoading } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Fetch venue information from the QR code token
  useEffect(() => {
    const getVenueFromToken = async () => {
      if (!token) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        // Get the venue ID from the QR code token
        const { data: qrData, error: qrError } = await supabase
          .from('venue_qr_codes')
          .select('venue_id')
          .eq('token', token)
          .eq('is_active', true)
          .single();

        if (qrError || !qrData) {
          console.error('Error fetching QR code data:', qrError);
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        // Get the venue details
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('*')
          .eq('id', qrData.venue_id)
          .single();

        if (venueError || !venueData) {
          console.error('Error fetching venue data:', venueError);
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setVenue(venueData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error processing QR code:', error);
        toast.error('Could not process the QR code');
        setNotFound(true);
        setIsLoading(false);
      }
    };

    getVenueFromToken();
  }, [token]);

  // Handle redirect once authentication state is known and venue is loaded
  useEffect(() => {
    if (!authLoading && venue && !isLoading) {
      handleRedirect(venue);
    }
  }, [authLoading, user, userType, venue, isLoading]);

  const handleRedirect = (venue: Venue) => {
    console.log('QR redirect: handling redirect for venue:', venue.name, 'user:', user?.id, 'userType:', userType);
    
    // If user is not logged in, redirect to auth page
    if (!user) {
      console.log('QR redirect: User not authenticated, storing venue ID and redirecting to auth');
      // Store the venue ID in session storage to redirect after login
      sessionStorage.setItem('qr_checkin_venue_id', venue.id);
      navigate('/auth');
      return;
    }

    // If user is a business user, show error message
    if (userType === 'business') {
      console.log('QR redirect: Business user trying to check in, showing error');
      toast.error('Check-in functionality is not available for business users');
      navigate('/');
      return;
    }

    // For regular users and admins, redirect to venue with check-in dialog
    console.log('QR redirect: Authenticated user, redirecting to check-in');
    navigate(`/?venueId=${venue.id}&action=check-in`);
  };

  // Show loading state while processing
  if (isLoading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-xl font-semibold">Processing Check-In...</h1>
        <p className="text-muted-foreground mt-2">Please wait while we prepare your check-in</p>
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
        <p className="text-muted-foreground mt-2 text-center">This check-in QR code is invalid or has expired.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  // This component doesn't render anything in the normal flow
  // as it immediately redirects
  return <div className="h-screen flex items-center justify-center">Redirecting...</div>;
};

export default VenueQrRedirect;
