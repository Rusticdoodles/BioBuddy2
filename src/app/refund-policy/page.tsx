import type { Metadata } from 'next'
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: 'Refund Policy | BioBuddy',
  description: 'Clear refund terms for BioBuddy subscriptions and lifetime licenses.',
}

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Refund Policy
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              At BioBuddy, we want you to be completely satisfied with your purchase. We believe in our product and stand behind it with fair, transparent refund policies. Here's everything you need to know about refunds and cancellations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">1. Lifetime License - 14 Day Money-Back Guarantee</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We offer a full refund within 14 days of your lifetime license purchase, no questions asked. We want you to have enough time to try BioBuddy and ensure it's the right fit for your learning style.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">✅ Lifetime Refund Terms</h3>
              <ul className="list-disc pl-6 mb-0 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Eligibility window:</strong> Must be within 14 days of purchase</li>
                <li><strong>Process:</strong> Email faliqwicaksono21@gmail.com with your order number</li>
                <li><strong>No questions asked:</strong> We'll process your refund without requiring a reason</li>
                <li><strong>Timeline:</strong> Refunds processed within 5-7 business days</li>
                <li><strong>Method:</strong> Refund issued to your original payment method</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">After 14 Days</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Lifetime licenses are non-refundable after the 14-day window. This is because the lifetime license provides permanent access to BioBuddy's features and ongoing updates.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Tip:</strong> Try the free tier or monthly subscription first if you're unsure about committing to a lifetime license!
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">2. Monthly Subscription</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Monthly subscriptions can be cancelled at any time from your dashboard or by contacting us. There are no commitments, contracts, or cancellation fees.
            </p>

            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">🔄 Monthly Cancellation Terms</h3>
              <ul className="list-disc pl-6 mb-0 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Cancel anytime:</strong> No commitment or long-term contract</li>
                <li><strong>Access continues:</strong> You retain full access until the end of your current billing period</li>
                <li><strong>No partial refunds:</strong> We do not refund for partial months or unused time</li>
                <li><strong>No cancellation fees:</strong> Cancel without any additional charges</li>
                <li><strong>Easy process:</strong> Cancel from your dashboard or email us</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">How to Cancel Your Monthly Subscription</h3>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-4">
              <p className="text-slate-700 dark:text-slate-300 mb-3 font-semibold">Option 1: Cancel from Dashboard (Recommended)</p>
              <ol className="list-decimal pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Log in to your BioBuddy account</li>
                <li>Go to your Dashboard</li>
                <li>Click on "Manage Subscription"</li>
                <li>Click "Cancel Subscription"</li>
                <li>Follow the confirmation prompts</li>
              </ol>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-4">
              <p className="text-slate-700 dark:text-slate-300 mb-3 font-semibold">Option 2: Email Us</p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Email: <a href="mailto:faliqwicaksono21@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">faliqwicaksono21@gmail.com</a></li>
                <li>Subject line: "Cancel Monthly Subscription"</li>
                <li>Include: Your account email address</li>
                <li>We'll confirm your cancellation within 24 hours</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">What Happens After Cancellation?</h3>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Your subscription will not renew at the end of your current billing period</li>
              <li>You'll retain full access to premium features until your paid period ends</li>
              <li>After your period ends, your account automatically reverts to the free tier (4 topics)</li>
              <li>Your saved concept maps and data remain intact</li>
              <li>You can resubscribe anytime to regain premium access</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">Why No Partial Month Refunds?</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Since monthly subscriptions are priced affordably at $4.99/month and can be canceled anytime without fees, we do not offer refunds for partial months. You're only billed for the month you're currently using, and you keep access through your paid period even after cancellation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">3. Free Tier</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The free tier is always available at no cost and requires no payment information. There are no refunds to process since it's completely free!
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Access to 4 unique topics</li>
              <li>Unlimited regenerations of those topics</li>
              <li>No credit card required</li>
              <li>No commitment or time limits</li>
              <li>Upgrade or downgrade anytime</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">4. How to Request a Refund</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              If you're eligible for a refund (lifetime license within 14 days), here's how to request one:
            </p>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">📧 Refund Request Steps</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Us</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Send an email to <a href="mailto:faliqwicaksono21@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">faliqwicaksono21@gmail.com</a></p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold mb-1">Include Your Order Number</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Found in your Lemon Squeezy purchase receipt email</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold mb-1">Provide Your Email</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">The email address used for your BioBuddy account and purchase</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold mb-1">Tell Us Why (Optional)</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">While not required, feedback helps us improve BioBuddy!</p>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">📅 Refund Processing Timeline</h3>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li><strong>Confirmation:</strong> You'll receive an email confirmation within 24 hours</li>
              <li><strong>Processing:</strong> Refunds are processed within 5-7 business days</li>
              <li><strong>Bank processing:</strong> May take an additional 3-5 days to appear in your account</li>
              <li><strong>Refund method:</strong> Issued to your original payment method (credit card, PayPal, etc.)</li>
              <li><strong>Notification:</strong> You'll receive an email when the refund is complete</li>
            </ul>

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
              <strong>Note:</strong> If you don't see your refund after 10 business days, please check with your bank or contact us for assistance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">5. Exceptions and Special Cases</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">Refunds May Be Denied For:</h3>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li><strong>Abuse of refund policy:</strong> Multiple purchases and refund requests (e.g., repeatedly buying and refunding)</li>
              <li><strong>Violations of Terms of Service:</strong> Accounts terminated for policy violations are not eligible for refunds</li>
              <li><strong>Outside refund window:</strong> Lifetime licenses requested after the 14-day window</li>
              <li><strong>Chargebacks:</strong> If you file a chargeback instead of requesting a refund through proper channels, your account may be suspended</li>
              <li><strong>Fraudulent activity:</strong> Any evidence of fraud or misuse</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">Special Circumstances</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              If you have special circumstances not covered by this policy (e.g., technical issues preventing use, billing errors, duplicate charges), please contact us at faliqwicaksono21@gmail.com. We'll review your case individually and work with you to find a fair solution.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">Upgrading from Monthly to Lifetime</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              If you're currently on a monthly subscription and want to upgrade to a lifetime license, email us! We'll help you upgrade and can credit your most recent monthly payment toward the lifetime price as a courtesy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">6. Payment Disputes and Chargebacks</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              If you have any billing concerns or believe you were charged incorrectly, please contact us directly before initiating a chargeback with your bank. We're happy to resolve any payment issues quickly and fairly.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              <strong>Important:</strong> Filing a chargeback without contacting us first may result in:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Immediate suspension of your BioBuddy account</li>
              <li>Loss of access to all saved content and concept maps</li>
              <li>Potential ineligibility for future refunds or service</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We process legitimate refund requests within 24 hours, so there's no need to go through your bank. Let's resolve it together!
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">7. Questions About Refunds?</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We're here to help! If you have any questions about our refund policy, billing, or subscriptions, don't hesitate to reach out.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Contact Support</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">We typically respond within 24 hours</p>
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Email:</strong> <a href="mailto:faliqwicaksono21@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">faliqwicaksono21@gmail.com</a>
              </p>
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>For Faster Help:</strong> Include your order number or account email
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-l-4 border-blue-600 p-4 rounded">
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                💡 <strong>Pro Tip:</strong> Not sure if BioBuddy is right for you? Start with the free tier (4 topics, unlimited regenerations) or try the monthly subscription ($4.99/month, cancel anytime) before committing to the lifetime license!
              </p>
            </div>
          </section>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-12">
            <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-4">
              This Refund Policy is effective as of {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} and applies to all BioBuddy purchases.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We reserve the right to update this policy. Any changes will be posted on this page with an updated date. For significant changes, we'll notify active subscribers via email.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

