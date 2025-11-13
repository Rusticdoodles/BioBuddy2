'use client';

import { X } from 'lucide-react';
import { useUser } from '@/components/AuthProvider';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal = ({ isOpen, onClose }: UpgradeModalProps) => {
  const { user } = useUser();
  
  if (!isOpen) {
    return null;
  }

  // Create checkout URLs with user email pre-filled
  const lifetimeUrl = user?.email 
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_LIFETIME_CHECKOUT_URL}?checkout[email]=${encodeURIComponent(user.email)}`
    : process.env.NEXT_PUBLIC_LEMONSQUEEZY_LIFETIME_CHECKOUT_URL;

  const monthlyUrl = user?.email
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_CHECKOUT_URL}?checkout[email]=${encodeURIComponent(user.email)}`
    : process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_CHECKOUT_URL;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
      tabIndex={-1}
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      }}
      aria-label="Upgrade to unlock unlimited topics"
    >
      <div
        className="relative w-full max-w-4xl mx-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl transition-all dark:border-slate-700 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Close upgrade modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-8">
          <h2 id="upgrade-modal-title" className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            🎉 You've Tried BioBuddy!
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            You've explored 4 topics. Ready to unlock unlimited access?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lifetime Card - Featured */}
          <div className="relative rounded-xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-400">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                ⭐ Best Value
              </span>
            </div>
            
            <div className="mt-4 text-center">
              <div className="mb-4">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">$39</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">one-time payment</p>
              </div>

              <ul className="text-left space-y-3 mb-6 text-slate-700 dark:text-slate-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Unlimited topics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>150 maps/month</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>All future features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Pay once, own forever</span>
                </li>
              </ul>

              <a
                href={lifetimeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Get Lifetime Access
              </a>
            </div>
          </div>

          {/* Monthly Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <div className="text-center">
              <div className="mb-4">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">$4.99</span>
                <span className="text-lg text-slate-600 dark:text-slate-400">/month</span>
              </div>

              <ul className="text-left space-y-3 mb-6 text-slate-700 dark:text-slate-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Unlimited topics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>150 maps/month</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Cancel anytime</span>
                </li>
              </ul>

              <a
                href={monthlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg bg-slate-700 px-6 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 dark:bg-slate-600 dark:hover:bg-slate-700"
              >
                Start Monthly
              </a>
            </div>
          </div>
        </div>

        {/* Secure checkout note */}
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          🔒 Secure checkout powered by Lemon Squeezy
        </p>
      </div>
    </div>
  );
};

