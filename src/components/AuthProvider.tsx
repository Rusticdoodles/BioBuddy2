'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { AuthModal } from '@/components/AuthModal';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthProvider = ({ children, requireAuth = false }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Show auth modal if auth is required and user is not logged in
  useEffect(() => {
    if (requireAuth && !loading && !user) {
      setShowAuthModal(true);
    } else if (user) {
      setShowAuthModal(false);
    }
  }, [requireAuth, loading, user]);

  // Show loading screen
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading BioBuddy...</p>
        </div>
      </div>
    );
  }

  // Block app if auth is required but user is not logged in
  if (requireAuth && !user) {
    return (
      <>
        <div className="flex h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="text-center mb-8 max-w-md">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Welcome to BioBuddy
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Please sign in to start creating concept maps and track your learning progress
            </p>
          </div>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => {
            // Don't allow closing when auth is mandatory
            if (!requireAuth) {
              setShowAuthModal(false);
            }
          }}
        />
      </>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useUser must be used within AuthProvider');
  }

  return context;
};



