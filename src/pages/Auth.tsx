import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'regular' | 'business'>('regular');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const type = searchParams.get('type');
    const token = searchParams.get('token') || searchParams.get('access_token');
    
    console.log('Auth page loaded. Type:', type, 'Token present:', !!token);
    
    // Handle password recovery case
    if (type === 'recovery') {
      console.log('Recovery mode detected in URL');
      
      const handlePasswordRecovery = async () => {
        try {
          // Get session to check if we're authenticated from the recovery link
          const { data, error } = await supabase.auth.getSession();
          console.log('Current session in recovery flow:', data?.session ? 'Active' : 'None');
          
          if (error) {
            console.error('Session error in recovery flow:', error);
            toast.error('Error verifying your session. Please try again.');
            return;
          }
          
          // If we have a token directly in the URL, we need to set up recovery mode
          if (token || data?.session) {
            console.log('Setting up password recovery mode');
            setIsPasswordRecovery(true);
            setIsLogin(false);
            setIsForgotPassword(false);
          }
        } catch (error) {
          console.error('Recovery flow error:', error);
          toast.error('Something went wrong with the password reset process.');
        }
      };
      
      handlePasswordRecovery();
    } else if (searchParams.get('forgot') === 'true') {
      setIsForgotPassword(true);
      setIsLogin(false);
      setIsPasswordRecovery(false);
    } else if (user && !isPasswordRecovery && !isForgotPassword) {
      // Don't redirect if we're supposed to be in recovery mode
      console.log('Detected logged in user, redirecting to home');
      navigate('/');
    }
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, 'Session:', !!session);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD_RECOVERY event received');
        setIsPasswordRecovery(true);
        setIsLogin(false);
        setIsForgotPassword(false);
      }
      
      if (event === 'USER_UPDATED') {
        console.log('USER_UPDATED event received - password was changed');
        toast.success('Password updated successfully');
        setLoading(false);
        
        // Wait briefly before redirecting
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      }
      
      // Don't redirect on SIGNED_IN event if we're in recovery mode
      if (event === 'SIGNED_IN' && type !== 'recovery') {
        console.log('SIGNED_IN event and not in recovery mode - redirecting to home');
        navigate('/', { replace: true });
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user, navigate, searchParams]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });
      if (error) throw error;
      toast.success('Password reset instructions have been sent to your email');
      setIsForgotPassword(false);
      setIsLogin(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      console.log('Starting password update...');
      if (password !== confirmPassword) {
        throw new Error("Passwords don't match");
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      console.log('Password update successful');
      // Navigation is handled by the USER_UPDATED event
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords don't match");
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: userType,
            },
          },
        });
        if (signUpError) throw signUpError;
        toast.success('Signup successful! Please check your email for verification.');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetFormFields = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUserType('regular');
  };

  if (isPasswordRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>
              Please enter your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you instructions to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => {
                  setIsForgotPassword(false);
                  resetFormFields();
                }}
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Login' : 'Sign Up'}</CardTitle>
          <CardDescription>
            {isLogin
              ? 'Welcome back! Please login to continue.'
              : 'Create an account to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>User Type</Label>
                  <RadioGroup
                    value={userType}
                    onValueChange={(value: 'regular' | 'business') => setUserType(value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regular" id="regular" />
                      <Label htmlFor="regular">Regular User</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="business" id="business" />
                      <Label htmlFor="business">Business User</Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </Button>
            {isLogin && (
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setIsForgotPassword(true)}
              >
                Forgot your password?
              </Button>
            )}
          </form>
          <Button
            variant="link"
            className="w-full mt-4"
            onClick={() => {
              setIsLogin(!isLogin);
              resetFormFields();
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
