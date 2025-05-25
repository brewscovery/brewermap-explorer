
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Define a type for the profile data returned from the RPC
interface UserProfileData {
  user_type: 'business' | 'regular' | 'admin';
  first_name: string | null;
  last_name: string | null;
}

interface LoginPopoverProps {
  triggerElement?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const LoginPopover = ({ triggerElement, open, onOpenChange }: LoginPopoverProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
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
            toast.error('Unable to load user profile. Some features may be limited.');
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
            toast.success('Logged in successfully');
          }
        } catch (error: any) {
          console.error('Error processing login:', error);
          toast.error('Error processing login. Please try again.');
        }
      } else {
        toast.success('Logged in successfully');
      }
      
      // Close the popover after successful login
      if (onOpenChange) {
        onOpenChange(false);
      }
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/auth?forgot=true');
  };

  const handleSignUp = () => {
    // Navigate directly to signup form instead of login screen
    navigate('/auth?signup=true');
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {triggerElement || <Button variant="outline">Login</Button>}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2 mb-4">
          <h3 className="font-medium text-lg">Welcome back</h3>
          <p className="text-sm text-muted-foreground">
            Login to access your account and preferences
          </p>
        </div>
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login'}
          </Button>
          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="link"
              className="text-xs p-0 h-auto"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-xs p-0 h-auto"
              onClick={handleSignUp}
            >
              Create account
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default LoginPopover;
