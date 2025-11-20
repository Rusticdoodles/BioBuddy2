'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMessage = {
  tone: 'success' | 'error';
  text: string;
};

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  const modalLabelId = useMemo(
    () => {
      if (isForgotPasswordMode) return 'auth-modal-forgot-password';
      return isSignUpMode ? 'auth-modal-sign-up' : 'auth-modal-sign-in';
    },
    [isSignUpMode, isForgotPasswordMode]
  );

  const resetFormState = useCallback(() => {
    setEmail('');
    setPassword('');
    setMessage(null);
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    resetFormState();
    onClose();
  }, [isSubmitting, onClose, resetFormState]);

  useEffect(() => {
    if (!isOpen) {
      resetFormState();
      setIsSignUpMode(false);
      setIsForgotPasswordMode(false);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose, isOpen, resetFormState]);

  const handleToggleMode = useCallback(() => {
    setIsSignUpMode((previous) => !previous);
    setIsForgotPasswordMode(false);
    setMessage(null);
  }, []);

  const handleShowForgotPassword = useCallback(() => {
    setIsForgotPasswordMode(true);
    setIsSignUpMode(false);
    setMessage(null);
  }, []);

  const handleBackToSignIn = useCallback(() => {
    setIsForgotPasswordMode(false);
    setIsSignUpMode(false);
    setMessage(null);
  }, []);

  const handleForgotPassword = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      if (!email.trim()) {
        setMessage({
          tone: 'error',
          text: 'Please provide your email address.',
        });
        return;
      }

      setIsSubmitting(true);
      setMessage(null);

      const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${redirectUrl}/reset-password`,
      });

      if (error) {
        setMessage({
          tone: 'error',
          text: error.message,
        });
        setIsSubmitting(false);
        return;
      }

      setMessage({
        tone: 'success',
        text: 'Check your email for a password reset link.',
      });
      setIsSubmitting(false);
    },
    [email, isSubmitting]
  );

  const handleAuth = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      if (!email.trim() || !password.trim()) {
        setMessage({
          tone: 'error',
          text: 'Please provide both email and password.',
        });
        return;
      }

      setIsSubmitting(true);
      setMessage(null);

      if (isSignUpMode) {
        const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            emailRedirectTo: `${redirectUrl}/auth/callback`,
          },
        });

        if (error) {
          setMessage({
            tone: 'error',
            text: error.message,
          });
          setIsSubmitting(false);
          return;
        }

        setMessage({
          tone: 'success',
          text: 'Check your email to confirm your account before signing in.',
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        setMessage({
          tone: 'error',
          text: error.message,
        });
        setIsSubmitting(false);
        return;
      }

      handleClose();
    },
    [email, handleClose, isSignUpMode, isSubmitting, password]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalLabelId}
      tabIndex={-1}
      onClick={handleClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          handleClose();
        }
      }}
      aria-label={
        isForgotPasswordMode
          ? 'Reset your password'
          : isSignUpMode
          ? 'Sign up for BioBuddy'
          : 'Sign in to BioBuddy'
      }
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl transition-all dark:border-slate-700 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        {/* <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Close authentication modal"
        >
          Esc
        </button> */}

        <h2 id={modalLabelId} className="text-2xl font-semibold text-slate-900 dark:text-white">
          {isForgotPasswordMode
            ? 'Reset your password'
            : isSignUpMode
            ? 'Create your BioBuddy account'
            : 'Welcome to BioBuddy'}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {isForgotPasswordMode
            ? "Enter your email address and we'll send you a link to reset your password."
            : isSignUpMode
            ? 'Join the community to save your concept maps and track your learning.'
            : 'Sign in to continue mapping your biology concepts.'}
        </p>

        {isForgotPasswordMode ? (
          <form className="mt-6 space-y-4" onSubmit={handleForgotPassword}>
            <label
              className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              htmlFor="auth-email"
            >
              Email
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-base text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            {message ? (
              <p
                className={clsx(
                  'rounded-lg px-3 py-2 text-sm',
                  message.tone === 'success'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                )}
                role={message.tone === 'error' ? 'alert' : 'status'}
              >
                {message.text}
              </p>
            ) : null}

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              aria-live="polite"
            >
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </button>

            <button
              type="button"
              onClick={handleBackToSignIn}
              className="w-full text-sm text-blue-600 transition hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              aria-label="Back to sign in"
            >
              Back to sign in
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleAuth}>
            <label
              className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              htmlFor="auth-email"
            >
              Email
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-base text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label
              className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              htmlFor="auth-password"
            >
              Password
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-base text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                placeholder="Enter a secure password"
                autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
                minLength={6}
                required
              />
            </label>

            {!isSignUpMode && (
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={handleShowForgotPassword}
                  className="text-xs text-blue-600 transition hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  aria-label="Forgot password"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {message ? (
              <p
                className={clsx(
                  'rounded-lg px-3 py-2 text-sm',
                  message.tone === 'success'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                )}
                role={message.tone === 'error' ? 'alert' : 'status'}
              >
                {message.text}
              </p>
            ) : null}

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              aria-live="polite"
            >
              {isSubmitting ? 'Loading…' : isSignUpMode ? 'Create account' : 'Sign in'}
            </button>
          </form>
        )}

        {!isForgotPasswordMode && (
          <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={handleToggleMode}
              className="text-blue-600 transition hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              aria-label={isSignUpMode ? 'Switch to sign in form' : 'Switch to sign up form'}
            >
              {isSignUpMode
                ? 'Already have an account? Sign in instead'
                : 'New to BioBuddy? Create an account.'}
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              We respect your privacy. Your email is used only for authentication and account recovery.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};