import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TEMP_ADMIN_CREDENTIALS, ADMIN_SESSION_STORAGE_KEY } from '../config/tempAdmin';
import type { User } from '@supabase/supabase-js';

export interface SignInResult {
  success: boolean;
  error?: string;
}

export function useAuth() {
  const isSupabase = isSupabaseConfigured();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (isSupabase) {
      // Will be verified asynchronously by Supabase getSession
      return false;
    }
    return sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isSupabase) {
      // 1. Check existing Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAuthenticated(Boolean(session));
        setCurrentUser(session?.user ?? null);
        setLoading(false);
      });

      // 2. Listen to Supabase auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(Boolean(session));
        setCurrentUser(session?.user ?? null);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Local dev storage fallback
      const handleStorage = () => {
        setIsAuthenticated(sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === 'true');
      };

      window.addEventListener('storage', handleStorage);
      window.addEventListener('hh:auth-changed', handleStorage);
      setLoading(false);

      return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('hh:auth-changed', handleStorage);
      };
    }
  }, [isSupabase]);

  const signIn = async (userOrEmail: string, pass: string): Promise<SignInResult> => {
    if (isSupabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: userOrEmail.trim(),
          password: pass,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.session) {
          setIsAuthenticated(true);
          setCurrentUser(data.user);
          return { success: true };
        }
        return { success: false, error: 'Could not establish session.' };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        return { success: false, error: message };
      }
    } else {
      // Local dev fallback
      if (
        userOrEmail.trim() === TEMP_ADMIN_CREDENTIALS.username &&
        pass === TEMP_ADMIN_CREDENTIALS.password
      ) {
        sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, 'true');
        setIsAuthenticated(true);
        window.dispatchEvent(new Event('hh:auth-changed'));
        return { success: true };
      }
      return { success: false, error: 'Invalid username or password.' };
    }
  };

  const signOut = async () => {
    if (isSupabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    setIsAuthenticated(false);
    setCurrentUser(null);
    window.dispatchEvent(new Event('hh:auth-changed'));
  };

  return {
    isAuthenticated,
    isSupabase,
    currentUser,
    loading,
    signIn,
    signOut,
  };
}

export default useAuth;
