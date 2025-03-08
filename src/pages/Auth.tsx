
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { PasswordRecoveryForm } from '@/components/auth/PasswordRecoveryForm';
import { AuthContainer } from '@/components/auth/AuthContainer';

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [authState, setAuthState] = useState({
    isLogin: true,
    isForgotPassword: false,
    isPasswordRecovery: false
  });

  useEffect(() => {
    const setupRecoveryMode = () => {
      console.log('Setting up recovery mode...');
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

    const type = searchParams.get('type');
    
    console.log('Current URL type parameter:', type);
    
    if (type === 'recovery') {
      console.log('Recovery URL detected, initializing recovery flow');
      handleRecoveryFlow();
    } else if (searchParams.get('forgot') === 'true') {
      setAuthState({
        isLogin: false,
        isForgotPassword: true,
        isPasswordRecovery: false
      });
    } else if (user && !authState.isPasswordRecovery && !authState.isForgotPassword) {
      navigate('/');
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [user, navigate, searchParams, authState.isPasswordRecovery, authState.isForgotPassword]);

  const handleSwitchToSignup = () => {
    setAuthState({
      isLogin: false,
      isForgotPassword: false,
      isPasswordRecovery: false
    });
  };

  const handleSwitchToLogin = () => {
    console.log('Switching to login view');
    setAuthState({
      isLogin: true,
      isForgotPassword: false,
      isPasswordRecovery: false
    });
  };

  const handleForgotPassword = () => {
    setAuthState({
      isLogin: false,
      isForgotPassword: true,
      isPasswordRecovery: false
    });
  };

  if (authState.isPasswordRecovery) {
    return (
      <AuthContainer 
        title="Set New Password" 
        description="Please enter your new password."
      >
        <PasswordRecoveryForm />
      </AuthContainer>
    );
  }

  if (authState.isForgotPassword) {
    return (
      <AuthContainer 
        title="Reset Password" 
        description="Enter your email address and we'll send you instructions to reset your password."
      >
        <ForgotPasswordForm onBackToLogin={handleSwitchToLogin} />
      </AuthContainer>
    );
  }

  return (
    <AuthContainer 
      title={authState.isLogin ? 'Login' : 'Sign Up'} 
      description={authState.isLogin 
        ? 'Welcome back! Please login to continue.' 
        : 'Create an account to get started.'}
    >
      {authState.isLogin ? (
        <LoginForm 
          onForgotPassword={handleForgotPassword} 
          onSwitchToSignup={handleSwitchToSignup} 
        />
      ) : (
        <SignupForm onSwitchToLogin={handleSwitchToLogin} />
      )}
    </AuthContainer>
  );
};

export default Auth;
