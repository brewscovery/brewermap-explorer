
import { AuthContainer } from '@/components/auth/AuthContainer';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { PasswordRecoveryForm } from '@/components/auth/PasswordRecoveryForm';

type AuthStateManagerProps = {
  authState: {
    isLogin: boolean;
    isForgotPassword: boolean;
    isPasswordRecovery: boolean;
  };
  onSwitchToLogin: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
};

export const AuthStateManager = ({
  authState,
  onSwitchToLogin,
  onSwitchToSignup,
  onForgotPassword
}: AuthStateManagerProps) => {
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
        <ForgotPasswordForm onBackToLogin={onSwitchToLogin} />
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
          onForgotPassword={onForgotPassword} 
          onSwitchToSignup={onSwitchToSignup} 
        />
      ) : (
        <SignupForm onSwitchToLogin={onSwitchToLogin} />
      )}
    </AuthContainer>
  );
};
