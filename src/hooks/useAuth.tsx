import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface SignInResult {
  success: boolean;
  error?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isSupabase: boolean;
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isSupabase = isSupabaseConfigured();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    if (isSupabase) {
      // 1. Verify existing cryptographic Supabase session
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          if (!mounted) return;
          setCurrentUser(session?.user || null);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching Supabase auth session:', err);
          if (!mounted) return;
          setCurrentUser(null);
          setLoading(false);
        });

      // 2. Listen to cryptographic Supabase auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        setCurrentUser(session?.user || null);
        setLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Offline fallback: when Supabase is not configured, no authenticated user
      setCurrentUser(null);
      setLoading(false);
    }
  }, [isSupabase]);

  const signIn = async (email: string, pass: string): Promise<SignInResult> => {
    const trimmedEmail = email.trim();

    if (!isSupabase) {
      return {
        success: false,
        error: 'Supabase authentication is not configured in .env',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: pass,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session && data.user) {
        setCurrentUser(data.user);
        return { success: true };
      }

      return { success: false, error: 'Could not establish authenticated session.' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    setCurrentUser(null);
    if (isSupabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out of Supabase:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(currentUser),
        isSupabase,
        currentUser,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
