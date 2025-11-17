'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/components/AuthProvider';
import { getUserSubscription, getTopicsUsed, getMapsThisMonth } from '@/lib/usage';

export const UsageStats = () => {
  const { user } = useUser();
  const [stats, setStats] = useState<{
    plan: string;
    topicsUsed: number;
    mapsThisMonth: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }

    const loadStats = async () => {
      try {
        const subscription = await getUserSubscription(user.id);
        const topics = await getTopicsUsed(user.id);
        const maps = await getMapsThisMonth(user.id);

        setStats({
          plan: subscription?.plan_type || 'free',
          topicsUsed: topics.length,
          mapsThisMonth: maps,
        });
      } catch (error) {
        console.error('Error loading usage stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  if (!user || loading || !stats) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
      <div className="flex items-center gap-2">
        <span className="font-medium">Plan:</span>
        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 capitalize">
          {stats.plan}
        </span>
      </div>
      {stats.plan === 'free' && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Topics:</span>
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300">
            {stats.topicsUsed} / 4
          </span>
        </div>
      )}
      {stats.plan !== 'free' && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Maps this month:</span>
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300">
            {stats.mapsThisMonth} / 150
          </span>
        </div>
      )}
    </div>
  );
};

