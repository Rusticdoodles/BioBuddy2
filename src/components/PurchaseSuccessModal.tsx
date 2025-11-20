'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, Sparkles } from 'lucide-react';
import { useUser } from '@/components/AuthProvider';
import { getUserSubscription } from '@/lib/usage';

interface PurchaseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType?: 'lifetime' | 'monthly';
}

export const PurchaseSuccessModal = ({ 
  isOpen, 
  onClose,
  planType = 'lifetime' 
}: PurchaseSuccessModalProps) => {
  if (!isOpen) {
    return null;
  }

  const planName = planType === 'lifetime' ? 'Lifetime' : 'Monthly';
  const features = planType === 'lifetime' 
    ? [
        'Unlimited topics',
        '100 maps per month',
        'All future features',
        'Lifetime access'
      ]
    : [
        'Unlimited topics',
        '100 maps per month',
        'Cancel anytime'
      ];

  const handleClose = () => {
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  const handleBackdropClick = () => {
    handleClose();
  };

  const handleContentClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-success-title"
      tabIndex={-1}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      aria-label="Purchase successful"
    >
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl transition-all dark:border-slate-700 dark:bg-slate-900 animate-scale-in"
        onClick={handleContentClick}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h2 
            id="purchase-success-title" 
            className="text-3xl font-bold text-slate-900 dark:text-white mb-2"
          >
            🎉 Welcome to Full BioBuddy!
          </h2>
          
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
            You now have access to the full BioBuddy experience with your <strong>{planName}</strong> plan!
          </p>

          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                What You Get
              </h3>
            </div>
            <ul className="space-y-2 text-left">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Start using BioBuddy"
          >
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook to detect purchase and manage modal state
export const usePurchaseDetection = () => {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [planType, setPlanType] = useState<'lifetime' | 'monthly'>('lifetime');
  const [hasChecked, setHasChecked] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setHasChecked(null);
      return;
    }

    // Reset check when user changes
    if (hasChecked !== user.id) {
      setHasChecked(null);
    }

    if (hasChecked === user.id) return;

    const checkPurchaseStatus = async () => {
      try {
        // Check URL params for purchase completion
        const urlParams = new URLSearchParams(window.location.search);
        const purchased = urlParams.get('purchased');
        const purchasedPlan = urlParams.get('plan') as 'lifetime' | 'monthly' | null;

        // Check if we've already shown this modal (using localStorage)
        const modalShownKey = `purchase-modal-shown-${user.id}`;
        const alreadyShown = localStorage.getItem(modalShownKey);

        if (purchased === 'true' && !alreadyShown) {
          setPlanType(purchasedPlan || 'lifetime');
          setShowModal(true);
          localStorage.setItem(modalShownKey, 'true');
          
          // Clean up URL params
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
          setHasChecked(user.id);
          return;
        }

        // Also check subscription status change
        // This catches cases where user returns after checkout but URL params weren't set
        const subscription = await getUserSubscription(user.id);
        
        if (subscription && subscription.status === 'active' && !alreadyShown) {
          // Check if subscription was recently created (within last 5 minutes)
          const createdAt = new Date(subscription.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - createdAt.getTime();
          const minutesDiff = timeDiff / (1000 * 60);

          if (minutesDiff < 5) {
            setPlanType(subscription.plan_type === 'lifetime' ? 'lifetime' : 'monthly');
            setShowModal(true);
            localStorage.setItem(modalShownKey, 'true');
          }
        }

        setHasChecked(user.id);
      } catch (error) {
        console.error('Error checking purchase status:', error);
        setHasChecked(user.id);
      }
    };

    checkPurchaseStatus();
  }, [user, hasChecked]);

  const handleClose = () => {
    setShowModal(false);
  };

  return { showModal, planType, handleClose };
};

