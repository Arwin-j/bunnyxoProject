import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TEMP_ADMIN_CREDENTIALS, ADMIN_SESSION_STORAGE_KEY } from '../config/tempAdmin';
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
  signIn: (userOrEmail: string, pass: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isSupabase = isSupabaseConfigured();

  // Initialize synchronously from sessionStorage for immediate rendering
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    if (isSupabase) {
      // 1. Check existing Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        if (session) {
          sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, 'true');
          setIsAuthenticated(true);
          setCurrentUser(session.user);
        } else {
          // If Supabase session is not found, check if authenticated via dev credentials
          const localAuth = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === 'true';
          setIsAuthenticated(localAuth);
          setCurrentUser(null);
        }
        setLoading(false);
      }).catch((err) => {
        console.error('Error fetching Supabase auth session:', err);
        if (!mounted) return;
        const localAuth = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === 'true';
        setIsAuthenticated(localAuth);
        setLoading(false);
      });

      // 2. Listen to Supabase auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        if (session) {
          sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, 'true');
          setIsAuthenticated(true);
          setCurrentUser(session.user);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
          setIsAuthenticated(false);
          setCurrentUser(null);
          setLoading(false);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Local dev storage fallback
      const localAuth = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === 'true';
      setIsAuthenticated(localAuth);
      setLoading(false);

      const handleStorage = () => {
        setIsAuthenticated(sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === 'true');
      };

      window.addEventListener('storage', handleStorage);
      return () => {
        window.removeEventListener('storage', handleStorage);
      };
    }
  }, [isSupabase]);

  const signIn = async (userOrEmail: string, pass: string): Promise<SignInResult> => {
    const trimmedInput = userOrEmail.trim();

    // 1. Master/Dev credentials bypass check - ALWAYS supported
    if (
      trimmedInput.toLowerCase() === TEMP_ADMIN_CREDENTIALS.username.toLowerCase() &&
      pass === TEMP_ADMIN_CREDENTIALS.password
    ) {
      sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setCurrentUser(null);
      return { success: true };
    }

    // 2. If Supabase is configured and not master dev credentials, attempt Supabase Auth
    if (isSupabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedInput,
          password: pass,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.session) {
          sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, 'true');
          setIsAuthenticated(true);
          setCurrentUser(data.user);
          return { success: true };
        }

        return { success: false, error: 'Could not establish session.' };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        return { success: false, error: message };
      }
    }

    // Fallback if credentials don't match
    return {
      success: false,
      error: 'Invalid credentials. (Hint: username is bunnyAdmin, password is bunny)',
    };
  };

  const signOut = async () => {
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    setIsAuthenticated(false);
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
        isAuthenticated,
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
