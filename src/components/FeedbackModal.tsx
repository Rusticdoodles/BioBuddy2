'use client';

import { useState } from 'react';
import { X, Send, Bug, Lightbulb, MessageCircle, Loader2 } from 'lucide-react';
import { useFeedbackContext } from '@/contexts/FeedbackContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Optional context for enhanced bug reports (overrides context from FeedbackContext)
  context?: {
    activeTopic?: string;
    topicName?: string;
    nodeCount?: number;
    edgeCount?: number;
    darkMode?: boolean;
  };
}

export const FeedbackModal = ({ isOpen, onClose, context: propContext }: FeedbackModalProps) => {
  // Try to get context from FeedbackContext provider, fallback to prop context
  const contextFromProvider = useFeedbackContext();
  const context = propContext || contextFromProvider || {};
  const [category, setCategory] = useState<'bug' | 'feature' | 'feedback'>('feedback');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Get Formspree form ID from environment variable
  // Fallback to placeholder if not set (user needs to configure it)
  const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID || 'YOUR_FORM_ID_HERE';

  if (!FORMSPREE_FORM_ID) {
    console.error('❌ NEXT_PUBLIC_FORMSPREE_FORM_ID is not set in .env.local')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    // Check if form ID is configured
    if (FORMSPREE_FORM_ID === 'YOUR_FORM_ID_HERE') {
      console.error('Formspree form ID not configured. Please set NEXT_PUBLIC_FORMSPREE_FORM_ID in your .env.local file.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Gather context information
      const contextData = {
        category,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
        viewport: typeof window !== 'undefined' 
          ? `${window.innerWidth}x${window.innerHeight}` 
          : 'Unknown',
        darkMode: typeof document !== 'undefined' 
          ? document.documentElement.classList.contains('dark') 
          : false,
        // BioBuddy-specific context (if provided)
        ...(context || {}),
      };

      // Use FormData format (application/x-www-form-urlencoded) which is more reliable with Formspree
      const formData = new URLSearchParams();
      formData.append('category', category.toUpperCase());
      formData.append('message', message);
      
      // Only include email if provided (Formspree may reject "No email provided" as invalid)
      if (email && email.trim()) {
        formData.append('email', email.trim());
      }
      
      formData.append('context', JSON.stringify(contextData, null, 2));

      const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (response.ok) {
        setSubmitStatus('success');
        setMessage('');
        setEmail('');

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
        }, 2000);
      } else {
        // Log detailed error information for debugging
        const errorText = await response.text();
        console.error('Formspree submission failed:', {
          status: response.status,
          statusText: response.statusText,
          response: errorText,
          formId: FORMSPREE_FORM_ID,
        });
        
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            🎙️ Share Your Feedback
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close feedback modal"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClose();
              }
            }}
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {submitStatus === 'success' ? (
          // Success State
          <div className="text-center py-8 animate-fade-in">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Thank you!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We&apos;ve received your feedback and will review it carefully.
            </p>
          </div>
        ) : (
          // Form
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                What would you like to share?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('bug')}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${category === 'bug' 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }
                  `}
                  aria-label="Report a bug"
                  tabIndex={0}
                >
                  <Bug className={`w-5 h-5 mx-auto mb-1 ${category === 'bug' ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`} />
                  <div className={`text-xs font-medium ${category === 'bug' ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    Bug
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('feature')}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${category === 'feature' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }
                  `}
                  aria-label="Suggest a feature"
                  tabIndex={0}
                >
                  <Lightbulb className={`w-5 h-5 mx-auto mb-1 ${category === 'feature' ? 'text-blue-500' : 'text-slate-600 dark:text-slate-400'}`} />
                  <div className={`text-xs font-medium ${category === 'feature' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    Feature
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('feedback')}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${category === 'feedback' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }
                  `}
                  aria-label="General feedback"
                  tabIndex={0}
                >
                  <MessageCircle className={`w-5 h-5 mx-auto mb-1 ${category === 'feedback' ? 'text-green-500' : 'text-slate-600 dark:text-slate-400'}`} />
                  <div className={`text-xs font-medium ${category === 'feedback' ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    Other
                  </div>
                </button>
              </div>
            </div>

            {/* Message Input */}
            <div>
              <label 
                htmlFor="feedback-message" 
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Tell us more
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  category === 'bug' 
                    ? 'Describe the bug and how to reproduce it...'
                    : category === 'feature'
                    ? 'What feature would you like to see?'
                    : 'Share your thoughts...'
                }
                rows={4}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         resize-none transition-all"
              />
            </div>

            {/* Optional Email */}
            <div>
              <label 
                htmlFor="feedback-email" 
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Email <span className="text-slate-500">(optional, for follow-up)</span>
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all"
              />
            </div>

            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-2">
                  {FORMSPREE_FORM_ID === 'YOUR_FORM_ID_HERE'
                    ? 'Feedback form is not configured. Please contact the administrator.'
                    : 'Failed to send feedback.'}
                </p>
                {FORMSPREE_FORM_ID !== 'YOUR_FORM_ID_HERE' && (
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                    This may be due to Formspree settings. Check the browser console for details. 
                    Make sure your Formspree form allows submissions from localhost in development.
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 
                         text-slate-700 dark:text-slate-300 rounded-lg
                         hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 transition-all hover-lift"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

