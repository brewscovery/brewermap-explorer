
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  user: User | null;
  userType: 'business' | 'regular' | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userType: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'business' | 'regular' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndHandleRecovery = async () => {
      // Check if we're in a password recovery flow by looking for both type and token
      const params = new URLSearchParams(window.location.search);
      const isPasswordRecovery = params.get('type') === 'recovery' && params.get('token');
      
      if (isPasswordRecovery) {
        console.log('Recovery flow detected, signing out user');
        // Immediately sign out any existing session
        await supabase.auth.signOut();
        setUser(null);
        setUserType(null);
        setLoading(false);
        return true;
      }
      return false;
    };

    const setupAuth = async () => {
      // First check if we're in recovery mode
      const isRecovery = await checkAndHandleRecovery();
      if (isRecovery) return;

      // If not in recovery mode, proceed with normal auth setup
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserType(session.user.id);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        // Double check we're not in recovery mode before updating auth state
        const isRecovery = await checkAndHandleRecovery();
        if (isRecovery) return;

        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserType(session.user.id);
        } else {
          setUserType(null);
        }
        setLoading(false);
      });

      setLoading(false);
      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuth();
  }, []);

  const fetchUserType = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user type:', error);
      return;
    }

    setUserType(data.user_type);
  };

  return (
    <AuthContext.Provider value={{ user, userType, loading }}>
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
