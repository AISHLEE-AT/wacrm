import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

type AccountRole = 'owner' | 'admin' | 'agent' | 'viewer' | 'user' | null;

interface AuthContextData {
  session: Session | null;
  loading: boolean;
  accountRole: AccountRole;
}

const AuthContext = createContext<AuthContextData>({
  session: null,
  loading: true,
  accountRole: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountRole, setAccountRole] = useState<AccountRole>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('account_role')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        setAccountRole(null);
      } else if (data) {
        setAccountRole(data.account_role as AccountRole);
      }
    } catch (err) {
      console.error(err);
      setAccountRole(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setAccountRole(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, accountRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
