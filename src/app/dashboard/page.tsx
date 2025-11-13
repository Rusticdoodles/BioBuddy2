'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/components/AuthProvider';
import { getUserSubscription, getTopicsUsed, getMapsThisMonth } from '@/lib/usage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({
    plan: 'free' as 'free' | 'monthly' | 'lifetime',
    topicsCount: 0,
    mapsThisMonth: 0,
    topics: [] as string[],
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      loadStats();
    }
  }, [user, loading, router]);

  const loadStats = async () => {
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
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
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

  return (
    <div className="min-h-screen bg-slate-50 py-8 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-4xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>

          {/* Plan Info Card */}
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Your Plan
              </h2>
              <span className={`rounded-full px-4 py-1 text-sm font-semibold ${planBadgeColor[stats.plan]}`}>
                {planName[stats.plan]}
              </span>
            </div>
            
            {stats.plan === 'free' && (
              <p className="text-slate-600 dark:text-slate-300">
                You're on the free tier. Upgrade to unlock unlimited topics!
              </p>
            )}
            
            {stats.plan === 'monthly' && (
              <p className="text-slate-600 dark:text-slate-300">
                You have unlimited topics with 100 maps per month.
              </p>
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

