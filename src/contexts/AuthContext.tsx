import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  user: User | null;
  userType: 'business' | 'regular' | null;
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
  const [userType, setUserType] = useState<'business' | 'regular' | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          
          // Fetch additional user data if needed
          if (session.user) {
            const { data } = await supabase
              .from('profiles')
              .select('user_type, first_name, last_name')
              .eq('id', session.user.id)
              .single();
              
            if (data) {
              setUserType(data.user_type || 'regular');
              setFirstName(data.first_name || '');
              setLastName(data.last_name || '');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (session) {
          setUser(session.user);
          
          // Don't make additional Supabase calls directly in the callback
          // Use setTimeout to avoid potential deadlocks
          if (session.user) {
            setTimeout(async () => {
              const { data } = await supabase
                .from('profiles')
                .select('user_type, first_name, last_name')
                .eq('id', session.user.id)
                .single();
                
              if (data) {
                setUserType(data.user_type || 'regular');
                setFirstName(data.first_name || '');
                setLastName(data.last_name || '');
              }
            }, 0);
          }
        } else {
          setUser(null);
          setUserType('regular');
          setFirstName('');
          setLastName('');
        }
      }
    );

    fetchInitialSession();

    return () => {
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
