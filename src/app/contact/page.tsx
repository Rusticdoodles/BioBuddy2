import type { Metadata } from 'next'
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: 'Contact Us | BioBuddy',
  description: 'Get in touch with BioBuddy support for questions, billing, or assistance.',
}

export default function Contact() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Contact Us
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-12">
          Have questions? We&apos;re here to help!
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Email Support
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              For general inquiries, support, and feedback
            </p>
            <a 
              href="mailto:faliqwicaksono21@gmail.com"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              faliqwicaksono21@gmail.com
            </a>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              We typically respond within 24 hours
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Billing & Refunds
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              Questions about payments, subscriptions, or refunds
            </p>
            <a 
              href="mailto:faliqwicaksono21@gmail.com"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              faliqwicaksono21@gmail.com
            </a>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Include your order number for faster help
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Common Questions
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                How do I cancel my subscription?
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Go to your Dashboard and click &quot;Manage Subscription&quot; to cancel anytime. Your access continues until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Can I upgrade from monthly to lifetime?
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Yes! Email us and we&apos;ll help you upgrade and credit your monthly payment toward the lifetime price.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Is my data secure?
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Absolutely. We use Supabase for secure data storage with encryption. Read our <a href="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a> for details.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Do you offer student discounts?
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                BioBuddy is already priced affordably for students! Email us if you have special circumstances and we&apos;ll see what we can do.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                What&apos;s your refund policy?
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Lifetime licenses have a 14-day money-back guarantee. Monthly subscriptions can be cancelled anytime (no partial refunds). See our <a href="/refund-policy" className="text-blue-600 dark:text-blue-400 hover:underline">Refund Policy</a> for full details.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                I found a bug or have a feature request
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                We&apos;d love to hear from you! Email us with details about the bug or your feature idea. We actively consider user feedback for future updates.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-6 py-3">
            <span className="text-2xl">📧</span>
            <p className="text-slate-600 dark:text-slate-300">
              We aim to respond to all emails within 24 hours (usually much faster!)
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Business Information
          </h3>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-4 text-slate-700 dark:text-slate-300">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Business Name</p>
                <p className="font-medium">BioBuddy</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Operator</p>
                <p className="font-medium">Arya Wicaksono</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Location</p>
                <p className="font-medium">United Kingdom</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Email</p>
                <p className="font-medium">
                  <a href="mailto:faliqwicaksono21@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    faliqwicaksono21@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

