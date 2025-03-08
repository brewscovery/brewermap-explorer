
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
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    const setupRecoveryMode = () => {
      console.log('Setting up recovery mode...');
      setIsPasswordRecovery(true);
      setIsLogin(false);
      setIsForgotPassword(false);
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
      setIsForgotPassword(true);
      setIsLogin(false);
      setIsPasswordRecovery(false);
    } else if (user && !isPasswordRecovery && !isForgotPassword) {
      navigate('/');
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [user, navigate, searchParams, isPasswordRecovery, isForgotPassword]);

  const handleSwitchToSignup = () => {
    setIsLogin(false);
    setIsForgotPassword(false);
  };

  const handleSwitchToLogin = () => {
    console.log('Switching to login view');
    setIsLogin(true);
    setIsForgotPassword(false);
    setIsPasswordRecovery(false); // Make sure this is also reset
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setIsLogin(false);
  };

  if (isPasswordRecovery) {
    return (
      <AuthContainer 
        title="Set New Password" 
        description="Please enter your new password."
      >
        <PasswordRecoveryForm />
      </AuthContainer>
    );
  }

  if (isForgotPassword) {
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
      title={isLogin ? 'Login' : 'Sign Up'} 
      description={isLogin 
        ? 'Welcome back! Please login to continue.' 
        : 'Create an account to get started.'}
    >
      {isLogin ? (
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
