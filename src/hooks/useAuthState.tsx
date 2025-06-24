
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type AuthState = {
  isLogin: boolean;
  isForgotPassword: boolean;
  isPasswordRecovery: boolean;
};

export const useAuthState = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [authState, setAuthState] = useState<AuthState>({
    isLogin: true,
    isForgotPassword: false,
    isPasswordRecovery: false
  });

  // Effect to handle URL parameters
  useEffect(() => {
    const type = searchParams.get('type');
    const forgot = searchParams.get('forgot');
    const signup = searchParams.get('signup');
    
    console.log('URL parameters changed:', { type, forgot, signup });
    
    if (type === 'recovery') {
      console.log('Setting recovery mode from URL parameter');
      setAuthState({
        isLogin: false,
        isForgotPassword: false,
        isPasswordRecovery: true
      });
    } else if (forgot === 'true') {
      console.log('Setting forgot password mode from URL parameter');
      setAuthState({
        isLogin: false,
        isForgotPassword: true,
        isPasswordRecovery: false
      });
    } else if (signup === 'true') {
      console.log('Setting signup mode from URL parameter');
      setAuthState({
        isLogin: false,
        isForgotPassword: false,
        isPasswordRecovery: false
      });
    } else if (!type && !forgot && !signup) {
      // Only reset to login if no special parameters are present
      console.log('No special parameters, defaulting to login view');
      setAuthState(prev => {
        // Only update if we're not already in login state to prevent unnecessary rerenders
        if (!prev.isLogin) {
          return {
            isLogin: true,
            isForgotPassword: false,
            isPasswordRecovery: false
          };
        }
        return prev;
      });
    }
  }, [searchParams]);

  // Effect to handle authentication state changes
  useEffect(() => {
    const setupRecoveryMode = () => {
      console.log('Setting up recovery mode from auth event...');
      setAuthState({
        isLogin: false,
        isForgotPassword: false,
        isPasswordRecovery: true
      });
    };

    const handleRecoveryFlow = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('Current session:', data?.session);
        if (error) throw error;
        
        if (data?.session?.user) {
          console.log('User authenticated in recovery flow');
          setupRecoveryMode();
        }
      } catch (error) {
        console.error('Recovery flow error:', error);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', session);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event received');
        setupRecoveryMode();
      }

      if (event === 'SIGNED_IN') {
        console.log('Sign in event during recovery');
        const type = searchParams.get('type');
        if (type === 'recovery') {
          setupRecoveryMode();
        }
      }

      if (event === 'USER_UPDATED') {
        console.log('User updated event received');
        toast.success('Password updated successfully');
        navigate('/dashboard', { replace: true });
      }
    });

    // Handle recovery flow based on URL
    const type = searchParams.get('type');
    if (type === 'recovery') {
      console.log('Recovery URL detected, initializing recovery flow');
      handleRecoveryFlow();
    }

    // Only redirect to home if user is on the auth page specifically and not during recovery
    if (user && location.pathname === '/auth' && !authState.isPasswordRecovery) {
      navigate('/', { replace: true });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [user, navigate, searchParams, location.pathname, authState.isPasswordRecovery]);

  const handleSwitchToSignup = () => {
    console.log('Switching to signup view');
    setAuthState({
      isLogin: false,
      isForgotPassword: false,
      isPasswordRecovery: false
    });
    
    // Clear any query parameters
    navigate('/auth', { replace: true });
  };

  const handleSwitchToLogin = () => {
    console.log('Switching to login view');
    setAuthState({
      isLogin: true,
      isForgotPassword: false,
      isPasswordRecovery: false
    });
    
    // Clear any query parameters
    navigate('/auth', { replace: true });
  };

  const handleForgotPassword = () => {
    console.log('Switching to forgot password view');
    setAuthState({
      isLogin: false,
      isForgotPassword: true,
      isPasswordRecovery: false
    });
    
    // Update URL to reflect forgot password state
    navigate('/auth?forgot=true', { replace: true });
  };

  return {
    authState,
    handleSwitchToSignup,
    handleSwitchToLogin,
    handleForgotPassword
  };
};
