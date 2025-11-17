import type { Metadata } from 'next'
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: 'Privacy Policy | BioBuddy',
  description: 'Learn how BioBuddy collects, uses, and protects your data.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">1. Introduction</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Welcome to BioBuddy! We're committed to protecting your privacy and being transparent about how we collect and use your data. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your personal data.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              BioBuddy is operated by Arya Wicaksono, based in the United Kingdom. By using BioBuddy, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">2.1 Account Information</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              When you create an account with BioBuddy, we collect:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Email address (used for authentication and account management)</li>
              <li>Authentication credentials (securely stored via Supabase)</li>
              <li>Account creation date and last login information</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">2.2 Usage Data</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              To provide and improve our service, we collect information about how you use BioBuddy:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Topics you generate concept maps for</li>
              <li>Number of concept maps created</li>
              <li>Interaction with features (regenerations, edits, saves)</li>
              <li>Subscription tier and usage limits</li>
              <li>Content you create and save within the platform</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">2.3 Technical Data</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We automatically collect certain technical information when you use BioBuddy:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>IP address and approximate geographic location</li>
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">2.4 Payment Information</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Payment information is processed securely by Lemon Squeezy, our payment processor. We do not store your full credit card details on our servers. We receive only transaction confirmation data and order information necessary to activate your subscription.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li><strong>Provide the Service:</strong> To create your account, generate AI-powered concept maps, and deliver the core functionality of BioBuddy</li>
              <li><strong>Process Payments:</strong> To manage subscriptions, process payments, and handle billing inquiries</li>
              <li><strong>Improve User Experience:</strong> To understand how you use BioBuddy and optimize features, fix bugs, and enhance performance</li>
              <li><strong>Customer Support:</strong> To respond to your inquiries, provide technical support, and resolve issues</li>
              <li><strong>Send Updates:</strong> To send important service announcements, account notifications, and updates about new features (you can opt-out of promotional emails)</li>
              <li><strong>Enforce Terms:</strong> To monitor for violations of our Terms of Service and prevent abuse of the platform</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">4. Data Sharing and Third-Party Services</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We work with trusted third-party service providers to deliver BioBuddy. Your data may be shared with:
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">4.1 Supabase (Data Storage & Authentication)</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We use Supabase to securely store your account information, authentication data, and generated content. Supabase provides enterprise-grade security and encryption. Learn more at <a href="https://supabase.com/privacy" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">4.2 Anthropic API (AI Processing)</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              When you generate a concept map, your topic query is sent to Anthropic's Claude API to create the AI-powered content. Anthropic does not use this data to train their models. Learn more at <a href="https://www.anthropic.com/privacy" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">anthropic.com/privacy</a>.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">4.3 Lemon Squeezy (Payment Processing)</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              All payments are processed through Lemon Squeezy, a secure payment platform. They handle your payment information according to PCI-DSS standards. Learn more at <a href="https://www.lemonsqueezy.com/privacy" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">lemonsqueezy.com/privacy</a>.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">4.4 Vercel (Hosting & Analytics)</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              BioBuddy is hosted on Vercel, which may collect basic analytics data to ensure service reliability and performance. Learn more at <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a>.
            </p>

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 mt-6">
              <strong>We do not sell your personal data to third parties.</strong> We only share data with the service providers listed above who help us operate BioBuddy, and they are contractually obligated to protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">5. Data Security</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We take data security seriously and implement industry-standard measures to protect your information:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li><strong>Encryption:</strong> All data is encrypted in transit using HTTPS/TLS and at rest in our databases</li>
              <li><strong>Secure Storage:</strong> Your data is stored on secure servers provided by Supabase with regular backups</li>
              <li><strong>Access Control:</strong> Access to user data is restricted to authorized personnel only</li>
              <li><strong>Authentication:</strong> We use secure authentication methods to protect your account</li>
              <li><strong>Regular Updates:</strong> We keep our systems updated with the latest security patches</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              While we strive to use commercially acceptable means to protect your personal data, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">6. Your Rights and Choices</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You have the following rights regarding your personal data:
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">6.1 Access Your Data</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You can view and access most of your data through your BioBuddy dashboard. For a complete copy of your data, email us at faliqwicaksono21@gmail.com.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">6.2 Delete Your Account</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You can request account deletion at any time by emailing faliqwicaksono21@gmail.com. We will permanently delete your account and associated data within 30 days, except where we're required to retain certain information for legal compliance (such as transaction records).
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">6.3 Export Your Data</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You can request a copy of your data in a portable format by emailing faliqwicaksono21@gmail.com. We'll provide your data within 30 days.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">6.4 Correct Inaccurate Data</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              If any of your personal information is inaccurate or incomplete, you can update it through your account settings or contact us for assistance.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">6.5 Opt-Out of Communications</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You can unsubscribe from promotional emails using the link in any email we send. Note that you'll still receive essential service-related emails (like password resets and billing notifications).
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">6.6 Rights for EU/UK Users (GDPR)</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              If you're located in the European Union or United Kingdom, you have additional rights under GDPR:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Right to object to data processing</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to withdraw consent at any time</li>
              <li>Right to lodge a complaint with your local data protection authority</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">6.7 Rights for California Users (CCPA)</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              If you're a California resident, you have the right to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Know what personal information we collect and how we use it</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of the sale of personal information (note: we do not sell personal data)</li>
              <li>Non-discrimination for exercising your privacy rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              BioBuddy uses cookies and similar tracking technologies to improve your experience:
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">7.1 Essential Cookies</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              These cookies are necessary for BioBuddy to function properly. They enable core features like:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Authentication and keeping you logged in</li>
              <li>Security and fraud prevention</li>
              <li>Remembering your preferences (like dark mode)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">7.2 Analytics Cookies</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We may use analytics cookies to understand how users interact with BioBuddy. This helps us improve the service and fix bugs. These cookies collect anonymized data about page views, feature usage, and performance metrics.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">7.3 Managing Cookies</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Most web browsers allow you to control cookies through their settings. However, disabling essential cookies may prevent you from using certain features of BioBuddy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">8. Data Retention</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We retain your personal data for as long as necessary to provide BioBuddy's services and fulfill the purposes outlined in this Privacy Policy:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li><strong>Active Accounts:</strong> We retain your data while your account is active</li>
              <li><strong>Inactive Accounts:</strong> If you stop using BioBuddy but don't delete your account, we may retain your data for up to 2 years</li>
              <li><strong>Deleted Accounts:</strong> After account deletion, we permanently remove your personal data within 30 days</li>
              <li><strong>Legal Requirements:</strong> We may retain certain data longer if required by law (e.g., transaction records for tax purposes)</li>
              <li><strong>Backups:</strong> Deleted data may persist in backup systems for up to 90 days</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">9. Children's Privacy</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              BioBuddy is designed for university students and is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              If you are a parent or guardian and believe your child has provided us with personal information, please contact us at faliqwicaksono21@gmail.com. We will take steps to delete such information from our systems.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">10. International Data Transfers</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              BioBuddy is operated from the United Kingdom. If you access our service from outside the UK, your data may be transferred to, stored, and processed in the UK and other countries where our service providers operate.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We ensure that such transfers comply with applicable data protection laws and that your data receives adequate protection through standard contractual clauses or other appropriate safeguards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. When we make changes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>We'll update the "Last updated" date at the top of this page</li>
              <li>For significant changes, we'll notify you via email or through a prominent notice on BioBuddy</li>
              <li>Your continued use of BioBuddy after changes take effect constitutes acceptance of the updated Privacy Policy</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We encourage you to review this Privacy Policy periodically to stay informed about how we protect your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">12. Contact Us</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or how we handle your data, please contact us:
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-4">
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Email:</strong> <a href="mailto:faliqwicaksono21@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">faliqwicaksono21@gmail.com</a>
              </p>
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Business Name:</strong> BioBuddy
              </p>
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Operator:</strong> Arya Wicaksono
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Location:</strong> United Kingdom
              </p>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We aim to respond to all privacy-related inquiries within 7 business days. For data access, deletion, or export requests, we'll respond within 30 days as required by law.
            </p>
          </section>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-12">
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              This Privacy Policy is effective as of {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} and applies to all users of BioBuddy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

