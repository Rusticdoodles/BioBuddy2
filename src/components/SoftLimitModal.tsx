'use client';

import { X, Mail } from 'lucide-react';

interface SoftLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapsGenerated: number;
}

export const SoftLimitModal = ({ isOpen, onClose, mapsGenerated }: SoftLimitModalProps) => {
  if (!isOpen) {
    return null;
  }

  const handleContactSupport = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = 'mailto:support@biobuddy.com?subject=Unlimited Usage Request';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="soft-limit-modal-title"
      tabIndex={-1}
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      }}
      aria-label="High usage notification"
    >
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl transition-all dark:border-slate-700 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <h2 id="soft-limit-modal-title" className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            📊 High Usage Detected
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            You've generated <span className="font-semibold text-blue-600 dark:text-blue-400">{mapsGenerated}</span> maps this month!
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-slate-700 dark:text-slate-300 text-center">
            That's amazing - you're really getting value from BioBuddy!
          </p>
          
          <p className="text-slate-600 dark:text-slate-400 text-sm text-center">
            Our fair use policy allows up to 150 maps per month. You can still access and regenerate your existing topics. For truly unlimited usage, please contact us.
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
            <p className="text-green-800 dark:text-green-300 text-sm font-medium flex items-center justify-center">
              <span className="mr-2">✅</span>
              You can still regenerate any of your existing topics!
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="mailto:support@biobuddy.com?subject=Unlimited Usage Request"
            onClick={handleContactSupport}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-slate-200 px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

