
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type LoginFormProps = {
  onForgotPassword: () => void;
  onSwitchToSignup: () => void;
};

// Define a type for the profile data returned from the RPC
interface UserProfileData {
  user_type: 'business' | 'regular' | 'admin';
  first_name: string | null;
  last_name: string | null;
}

export const LoginForm = ({ onForgotPassword, onSwitchToSignup }: LoginFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, authenticate the user
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // After successful authentication, fetch the user's profile to check user type
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .rpc('get_user_profile', { profile_id: session.user.id });
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            toast.error('Error fetching user profile. Some features may be limited.');
            navigate('/');
            return;
          }
          
          // Properly cast the JSON response to our interface
          const userProfile = profileData as unknown as UserProfileData;
          
          // Redirect based on user type
          if (userProfile.user_type === 'admin') {
            navigate('/admin');
          } else if (userProfile.user_type === 'business') {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        } catch (profileErr) {
          console.error('Error in profile fetch:', profileErr);
          toast.error('Error fetching user profile data');
          navigate('/');
        }
      } else {
        // Fallback to home if session is unexpectedly missing
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
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
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </Button>
      <Button
        type="button"
        variant="link"
        className="w-full"
        onClick={onForgotPassword}
      >
        Forgot your password?
      </Button>
      <Button
        variant="link"
        className="w-full"
        onClick={onSwitchToSignup}
      >
        Don't have an account? Sign up
      </Button>
      <Button
        variant="link"
        className="w-full"
        onClick={navigate('/')}
      >
        Return to map
      </Button>
    </form>
  );
};
