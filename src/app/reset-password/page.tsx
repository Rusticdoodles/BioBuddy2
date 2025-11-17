'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

import { supabase } from '@/lib/supabase';

type ResetMessage = {
  tone: 'success' | 'error';
  text: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<ResetMessage | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a valid session from the reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsValidToken(!!session);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidToken(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      if (!password.trim() || !confirmPassword.trim()) {
        setMessage({
          tone: 'error',
          text: 'Please provide both password fields.',
        });
        return;
      }

      if (password !== confirmPassword) {
        setMessage({
          tone: 'error',
          text: 'Passwords do not match.',
        });
        return;
      }

      if (password.length < 6) {
        setMessage({
          tone: 'error',
          text: 'Password must be at least 6 characters.',
        });
        return;
      }

      setIsSubmitting(true);
      setMessage(null);

      const { error } = await supabase.auth.updateUser({
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

      setMessage({
        tone: 'success',
        text: 'Password updated successfully! Redirecting...',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    },
    [password, confirmPassword, isSubmitting, router]
  );

  if (isValidToken === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-600 dark:text-slate-300">Loading...</div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Invalid or Expired Link
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Set New Password</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Enter your new password below.</p>

        <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
          <label
            className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
            htmlFor="new-password"
          >
            New Password
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-base text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder="Enter your new password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          <label
            className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
            htmlFor="confirm-password"
          >
            Confirm Password
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-base text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder="Confirm your new password"
              autoComplete="new-password"
              minLength={6}
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
            {isSubmitting ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

