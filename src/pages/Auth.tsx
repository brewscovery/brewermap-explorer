
import { useAuthState } from '@/hooks/useAuthState';
import { AuthStateManager } from '@/components/auth/AuthStateManager';

const Auth = () => {
  const { 
    authState, 
    handleSwitchToSignup, 
    handleSwitchToLogin, 
    handleForgotPassword 
  } = useAuthState();

  return (
    <AuthStateManager
      authState={authState}
      onSwitchToLogin={handleSwitchToLogin}
      onSwitchToSignup={handleSwitchToSignup}
      onForgotPassword={handleForgotPassword}
    />
  );
};

export default Auth;
