
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
    // First check if we're in a recovery flow
    const params = new URLSearchParams(window.location.search);
    const isRecovery = params.get('type') === 'recovery';

    if (isRecovery) {
      // Immediately sign out and clear state for recovery flow
      const handleRecovery = async () => {
        console.log('Recovery flow detected, signing out user');
        await supabase.auth.signOut();
        setUser(null);
        setUserType(null);
        setLoading(false);
      };
      handleRecovery();
      return;
    }

    // Only proceed with normal auth flow if not in recovery
    const setupAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserType(session.user.id);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (window.location.search.includes('type=recovery')) {
          // Double check we're not in recovery mode
          return;
        }
        
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
