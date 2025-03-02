
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Map from '@/components/Map';
import BreweryForm from '@/components/BreweryForm';
import type { Brewery } from '@/types/brewery';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from '@/components/ui/label';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, userType } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'city' | 'country'>('name');
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const initialSessionSetRef = useRef(false);
  const authEventsProcessedRef = useRef(new Set<string>());

  // Log current URL parameters for debugging
  useEffect(() => {
    const typeParam = searchParams.get('type');
    console.log(`Current URL type parameter: ${typeParam}`);
    
    if (typeParam === 'recovery') {
      console.log('Recovery URL detected, initializing recovery flow');
    }
  }, [searchParams]);

  // Process auth state changes
  useEffect(() => {
    if (!user) return;

    // Setup auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const eventKey = `${event}-${Date.now()}`;
      
      // Prevent processing the same event multiple times
      if (authEventsProcessedRef.current.has(eventKey)) return;
      authEventsProcessedRef.current.add(eventKey);
      
      console.log(`Auth event: ${event}`, session ? 'Session: Object' : 'Session: null');
      
      // Handle password recovery event
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event received');
        console.log('Setting up recovery mode...');
        
        // Mark that a password reset is happening and store in localStorage
        localStorage.setItem('password_reset_in_progress', 'true');
        localStorage.setItem('password_reset_timestamp', Date.now().toString());
      }
      
      // Handle user session established
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        console.log(`Current session: Object`);
        
        // Check if we're in a recovery flow
        const inRecoveryFlow = 
          searchParams.get('type') === 'recovery' || 
          localStorage.getItem('password_reset_in_progress') === 'true';
        
        if (inRecoveryFlow && session?.user) {
          console.log('User authenticated in recovery flow');
          console.log('Setting up recovery mode...');
          
          // For password change completion, we'll rely on USER_UPDATED event
        }
      }
      
      // Handle user update (which happens after password change)
      if (event === 'USER_UPDATED' && session?.user) {
        console.log('User updated event received');
        
        // Clear the in-progress flag
        localStorage.removeItem('password_reset_in_progress');
        
        // Set successful completion flag with timestamp
        localStorage.setItem('password_reset_completed', 'true');
        localStorage.setItem('password_reset_timestamp', Date.now().toString());
        
        // Trigger map reinitialization
        setPasswordReset(true);
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [user, searchParams]);

  // Check for password reset flag in URL and localStorage
  useEffect(() => {
    // Only run once the user is loaded
    if (!user) return;
    
    const typeParam = searchParams.get('type');
    const resetFlag = localStorage.getItem('password_reset_completed');
    const resetTimestamp = localStorage.getItem('password_reset_timestamp');
    const currentTime = Date.now();
    
    // Only consider reset flag valid if it was set within the last 10 minutes
    const isRecentReset = resetTimestamp && 
      (currentTime - parseInt(resetTimestamp)) < 10 * 60 * 1000;
    
    // Check recovery from URL parameter
    if (typeParam === 'recovery' && user) {
      console.log('Password reset detected from URL params');
      
      // Store the flag in localStorage for persistence
      localStorage.setItem('password_reset_completed', 'true');
      localStorage.setItem('password_reset_timestamp', Date.now().toString());
      
      // Set the state to trigger map reinitialization
      setPasswordReset(true);
      
      // Clean up URL without refreshing the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
    // Check recovery from localStorage flag
    else if (resetFlag === 'true' && isRecentReset && user) {
      console.log('Password reset detected from localStorage flag');
      setPasswordReset(true);
    }
  }, [user, searchParams]);

  // Reset passwordReset flag after a delay
  useEffect(() => {
    if (passwordReset) {
      const timer = setTimeout(() => {
        console.log('Resetting password reset flag after timeout');
        setPasswordReset(false);
        
        // Clear the localStorage flags to avoid re-triggering on future page loads
        localStorage.removeItem('password_reset_completed');
        localStorage.removeItem('password_reset_timestamp');
      }, 30000); // Extended timeout to ensure map has time to fully reinitialize
      
      return () => clearTimeout(timer);
    }
  }, [passwordReset]);

  // Check if user is coming from Auth page with a password reset success
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'password_reset_completed' && e.newValue === 'true' && user) {
        console.log('Password reset detected from storage event');
        setPasswordReset(true);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Fetch breweries data
  const { data: breweries = [], isLoading: breweriesLoading, error, refetch } = useQuery({
    queryKey: ['breweries', searchTerm, searchType],
    queryFn: async () => {
      if (!searchTerm) {
        const { data, error } = await supabase
          .from('breweries')
          .select('*');

        if (error) throw error;
        return data || [];
      }

      if (searchType === 'city') {
        const { data, error } = await supabase.functions.invoke('geocode-city', {
          body: { city: searchTerm }
        });

        if (error) throw error;
        return data || [];
      }

      const { data, error } = await supabase
        .from('breweries')
        .select('*')
        .filter(
          searchType === 'name' 
            ? 'name' 
            : 'country',
          'ilike',
          `%${searchTerm}%`
        );

      if (error) throw error;
      return data || [];
    }
  });

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      toast.success('Logged in successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      toast.error('Failed to logout. Please try again.');
    }
  };

  // Forgot password handler
  const handleForgotPassword = () => {
    navigate('/auth?forgot=true');
  };

  // Handle errors from brewery fetching
  useEffect(() => {
    if (error) {
      toast.error('Failed to load breweries');
    }
  }, [error]);

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-background/80 backdrop-blur-sm border-b flex justify-between items-center fixed w-full z-50">
        <h1 className="text-xl font-bold">Brewery Explorer</h1>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {userType === 'business' ? 'Business Account' : 'Regular Account'}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Login</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
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
                    <Button
                      type="button"
                      variant="link"
                      className="w-full"
                      onClick={handleForgotPassword}
                    >
                      Forgot your password?
                    </Button>
                  </form>
                </PopoverContent>
              </Popover>
              <Button onClick={() => navigate('/auth')}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 pt-[73px]">
        <Map
          breweries={breweries}
          onBrewerySelect={setSelectedBrewery}
          passwordReset={passwordReset}
        />
      </div>
      {userType === 'business' && (
        <div className="p-6 bg-card border-t">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Brewery</h2>
            <BreweryForm onSubmitSuccess={refetch} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
