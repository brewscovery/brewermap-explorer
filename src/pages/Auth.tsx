
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
  const { user } = useAuth();
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

    // Set up auth state change listener
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

      // If the user's password was successfully updated, redirect to home
      if (event === 'USER_UPDATED') {
        console.log('User updated event received');
        toast.success('Password updated successfully');
        setLoading(false);
        navigate('/', { replace: true });
      }
    });

    // Check URL parameters on mount
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
      // Note: The navigation and success message will be handled by the AUTH_STATE_CHANGE listener
      
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
