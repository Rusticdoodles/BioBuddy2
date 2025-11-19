'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/components/AuthProvider';
import { getUserSubscription, getTopicsUsed, getMapsThisMonth } from '@/lib/usage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({
    plan: 'free' as 'free' | 'monthly' | 'lifetime',
    topicsCount: 0,
    mapsThisMonth: 0,
    topics: [] as string[],
    subscriptionStatus: 'active' as 'active' | 'cancelled' | 'inactive',
    expiresAt: null as string | null,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadStats = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const [subscription, topics, maps] = await Promise.all([
        getUserSubscription(user.id),
        getTopicsUsed(user.id),
        getMapsThisMonth(user.id),
      ]);

      setStats({
        plan: subscription?.plan_type || 'free',
        topicsCount: topics.length,
        mapsThisMonth: maps,
        topics,
        subscriptionStatus: subscription?.status || 'inactive',
        expiresAt: subscription?.expires_at || null,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      loadStats();
    }
  }, [user, loading, router, loadStats]);

  const handleCancelSubscription = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel your monthly subscription? You will retain access until the end of your billing period.'
    );

    if (!confirmed) return;

    setIsCancelling(true);

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        const expiresAtDate = data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : 'the end of your billing period';
        alert(`Subscription cancelled successfully. You will retain access until ${expiresAtDate}.`);
        // Reload stats to update UI
        await loadStats();
      } else {
        alert(`Failed to cancel subscription: ${data.error}`);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('An error occurred while cancelling your subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getRemainingDays = (): number | null => {
    if (!stats.expiresAt) return null;
    const expiresAt = new Date(stats.expiresAt);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading || loadingStats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-lg text-slate-600 dark:text-slate-300">Loading...</div>
      </div>
    );
  }

  const planBadgeColor = {
    free: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    monthly: 'bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
    lifetime: 'bg-purple-200 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200',
  };

  const planName = {
    free: 'Free',
    monthly: 'Monthly',
    lifetime: 'Lifetime',
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex flex-col items-start gap-4">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Dashboard
            </h1>
            <button
              onClick={handleGoBack}
              aria-label="Go back to previous page"
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
              Back
            </button>
          </div>
          <div></div>

          {/* Plan Info Card */}
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Your Plan
              </h2>
              <span className={`rounded-full px-4 py-1 text-sm font-semibold ${planBadgeColor[stats.plan]}`}>
                {planName[stats.plan]}
                {stats.subscriptionStatus === 'cancelled' && stats.plan === 'monthly' && ' (Ending Soon)'}
              </span>
            </div>
            
            {stats.plan === 'free' && (
              <p className="text-slate-600 dark:text-slate-300">
                You&apos;re on the free tier. Upgrade to unlock unlimited topics!
              </p>
            )}
            
            {stats.plan === 'monthly' && (
              <>
                {stats.subscriptionStatus === 'cancelled' ? (
                  <>
                    <div className="mb-4 rounded-lg border-2 border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                      <p className="mb-2 font-semibold text-orange-800 dark:text-orange-300">
                        ⚠️ Subscription Cancelled
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-400">
                        {getRemainingDays() !== null ? (
                          <>
                            You still have access to premium features for <strong>{getRemainingDays()} {getRemainingDays() === 1 ? 'day' : 'days'}</strong>.
                            {stats.expiresAt && (
                              <> Your subscription will end on <strong>{new Date(stats.expiresAt).toLocaleDateString()}</strong>.</>
                            )}
                          </>
                        ) : (
                          'Your subscription has ended. You are now on the free plan.'
                        )}
                      </p>
                    </div>
                    <p className="mb-4 text-slate-600 dark:text-slate-300">
                      You currently have unlimited topics with 100 maps per month until your subscription ends.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-4 text-slate-600 dark:text-slate-300">
                      You have unlimited topics with 100 maps per month.
                    </p>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                      className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950/20"
                    >
                      {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                  </>
                )}
              </>
            )}
            
            {stats.plan === 'lifetime' && (
              <p className="text-slate-600 dark:text-slate-300">
                🎉 You have lifetime access! Thanks for supporting BioBuddy.
              </p>
            )}
          </div>

          {/* Usage Stats Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Topics Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                Topics Explored
              </h3>
              <div className="mb-1 text-3xl font-bold text-slate-900 dark:text-white">
                {stats.topicsCount}
                {stats.plan === 'free' && <span className="text-slate-400"> / 4</span>}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {stats.plan === 'free' 
                  ? `${4 - stats.topicsCount} topics remaining in free tier`
                  : 'Unlimited topics'}
              </p>
            </div>

            {/* Maps Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                Maps This Month
              </h3>
              <div className="mb-1 text-3xl font-bold text-slate-900 dark:text-white">
                {stats.mapsThisMonth}
                {stats.plan !== 'free' && <span className="text-slate-400"> / 100</span>}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {stats.plan === 'free'
                  ? 'Upgrade for monthly map tracking'
                  : `${100 - stats.mapsThisMonth} maps remaining this month`}
              </p>
            </div>
          </div>

          {/* Topics List */}
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">
              Your Topics
            </h2>
            {stats.topics.length > 0 ? (
              <ul className="space-y-2">
                {stats.topics.map((topic, index) => (
                  <li 
                    key={topic}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-700"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                      {index + 1}
                    </span>
                    <span className="text-slate-900 dark:text-white">{topic}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400">
                No topics generated yet. Start exploring!
              </p>
            )}
          </div>

          {/* Upgrade CTA (for free users) */}
          {stats.plan === 'free' && (
            <div className="rounded-xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center shadow-lg dark:from-blue-900/20 dark:to-indigo-900/20">
              <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                Ready to Unlock More?
              </h2>
              <p className="mb-6 text-slate-600 dark:text-slate-300">
                Get unlimited topics and supercharge your biology learning
              </p>
              <Link
                href="/map"
                className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Start Learning
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

