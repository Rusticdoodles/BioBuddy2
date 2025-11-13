'use client';

import { useUser } from '@/components/AuthProvider';
import { Navbar } from '@/components/navbar';

const PricingPage = () => {
  const { user } = useUser();
  
  // Create checkout URLs with user email pre-filled
  const lifetimeUrl = user?.email 
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_LIFETIME_CHECKOUT_URL}?checkout[email]=${encodeURIComponent(user.email)}`
    : process.env.NEXT_PUBLIC_LEMONSQUEEZY_LIFETIME_CHECKOUT_URL;

  const monthlyUrl = user?.email
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_CHECKOUT_URL}?checkout[email]=${encodeURIComponent(user.email)}`
    : process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_CHECKOUT_URL;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              🎉 Choose Your Plan
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Unlock unlimited access to BioBuddy and master biology with ease
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
          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            🔒 Secure checkout powered by Lemon Squeezy
          </p>

          {/* Additional information */}
          <div className="mt-12 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 text-center">
              Why Choose BioBuddy?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-2">🧬</div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Master Biology
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Create comprehensive mind maps for any biology topic
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Save Time
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Generate detailed study materials in seconds
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Study Smarter
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Visual learning aids for better retention
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

