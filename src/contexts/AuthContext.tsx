
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  userType: 'business' | 'regular' | 'admin' | null;
  firstName: string | null;
  lastName: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userType: null,
  firstName: null,
  lastName: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'business' | 'regular' | 'admin' | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileFetchAttempted, setProfileFetchAttempted] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    // Skip if we've already attempted to fetch for this session
    if (profileFetchAttempted) return;
    
    setProfileFetchAttempted(true);
    
    try {
      console.log('Fetching profile for user:', userId);
      
      // Use a direct query to the profiles table with a type assertion
      // This avoids RPC typing issues while still benefiting from the secure RLS policies
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type, first_name, last_name')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Unable to load user profile. Some features may be limited.');
        return;
      }
      
      console.log('Profile data received:', data);
      if (data) {
        setUserType(data.user_type as 'business' | 'regular' | 'admin' || 'regular');
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
      } else {
        console.log('No profile found for user:', userId);
        setUserType('regular');
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      toast.error('Something went wrong while loading your profile.');
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const fetchInitialSession = async () => {
      try {
        console.log('Fetching initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session) {
          console.log('Initial session found', session.user.id);
          setUser(session.user);
          
          // Fetch additional user data if needed
          if (session.user) {
            await fetchUserProfile(session.user.id);
          }
        } else {
          console.log('No initial session found');
          setUserType(null);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        
        if (session) {
          console.log('Session found in auth state change', session.user.id);
          setUser(session.user);
          setProfileFetchAttempted(false); // Reset flag on new auth event
          
          // Use setTimeout to avoid potential deadlocks
          if (session.user) {
            setTimeout(async () => {
              if (mounted) {
                await fetchUserProfile(session.user.id);
              }
            }, 0);
          }
        } else {
          console.log('No session in auth state change');
          setUser(null);
          setUserType(null);
          setFirstName(null);
          setLastName(null);
          setProfileFetchAttempted(false);
        }
      }
    );

    fetchInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userType, firstName, lastName, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
