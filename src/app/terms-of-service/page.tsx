import type { Metadata } from 'next'
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: 'Terms of Service | BioBuddy',
  description: 'Terms and conditions for using BioBuddy, the AI-powered concept mapping tool for biology students.',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Terms of Service
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">1. Agreement to Terms</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Welcome to BioBuddy! These Terms of Service (&quot;Terms&quot;) govern your access to and use of BioBuddy&apos;s website, services, and applications (collectively, the &quot;Service&quot;). By accessing or using BioBuddy, you agree to be bound by these Terms.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              <strong>Please read these Terms carefully before using BioBuddy.</strong> If you do not agree with these Terms, you may not access or use the Service.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              BioBuddy is operated by Arya Wicaksono, based in the United Kingdom. These Terms constitute a legally binding agreement between you and BioBuddy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">2. Description of Service</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              BioBuddy is an AI-powered educational platform designed to help university biology students master complex topics through interactive concept maps. Our Service includes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>AI-generated concept maps for biology topics</li>
              <li>Interactive visual learning tools</li>
              <li>Ability to save, edit, and regenerate concept maps</li>
              <li>Access to study materials and educational resources</li>
              <li>User dashboard for managing your learning content</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              BioBuddy uses artificial intelligence (Anthropic&apos;s Claude API) to generate educational content. While we strive for accuracy, AI-generated content should be used as a study aid and not as a substitute for official course materials or professional medical advice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">3. Account Registration and Security</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">3.1 Creating an Account</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              To access certain features of BioBuddy, you must create an account. When registering, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Be at least 13 years old (or the age of majority in your jurisdiction)</li>
              <li>Create only one account per person</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">3.2 Account Security</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You are responsible for all activity that occurs under your account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Immediately notify us of any unauthorized use of your account</li>
              <li>Not share your account credentials with others</li>
              <li>Not allow others to access your account</li>
              <li>Take appropriate security measures to protect your account</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              BioBuddy is not liable for any loss or damage arising from your failure to maintain account security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">4. Subscription Plans and Pricing</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">4.1 Free Tier</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              BioBuddy offers a free tier that includes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>4 unique topics with concept map generation</li>
              <li>Unlimited regenerations of those 4 topics</li>
              <li>Access to basic features</li>
              <li>No credit card required</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">4.2 Monthly Subscription</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The Monthly subscription is priced at $4.99 USD per month and includes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Unlimited unique topics</li>
              <li>Up to 150 concept maps per month</li>
              <li>Unlimited regenerations</li>
              <li>Access to all premium features</li>
              <li>Cancel anytime with no commitment</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">4.3 Lifetime License</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The Lifetime license is a one-time payment of $39 USD and includes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Unlimited unique topics forever</li>
              <li>Up to 150 concept maps per month</li>
              <li>Unlimited regenerations</li>
              <li>Lifetime access to all features</li>
              <li>One-time payment, no recurring charges</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">4.4 Usage Limits</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              To ensure fair use and maintain service quality, paid plans are limited to 150 concept map generations per month. The limit resets on your billing anniversary date. Regenerating an existing topic does not count toward this limit.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">5. Payment Terms</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">5.1 Payment Processing</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              All payments are processed securely through Lemon Squeezy, our third-party payment processor. By making a purchase, you agree to Lemon Squeezy&apos;s terms and conditions.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">5.2 Billing and Renewal</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              For Monthly subscriptions:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Your subscription automatically renews each month unless canceled</li>
              <li>You&apos;ll be charged on the same day each month</li>
              <li>You must cancel before your renewal date to avoid being charged</li>
              <li>Billing is handled entirely through Lemon Squeezy</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              For Lifetime licenses:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>One-time payment with no recurring charges</li>
              <li>Instant activation upon payment confirmation</li>
              <li>Lifetime access to your account and all features</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">5.3 Price Changes</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We reserve the right to change our prices at any time. For existing Monthly subscribers:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>You&apos;ll be notified at least 30 days before any price increase</li>
              <li>The new price applies to your next billing cycle after the notice period</li>
              <li>You may cancel before the price change takes effect</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Lifetime license holders are not affected by price changes and maintain access at the original purchase price.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">5.4 Taxes</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              All prices are in USD. Applicable taxes (such as VAT or sales tax) may be added at checkout depending on your location.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">5.5 Refunds</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Refund terms are detailed in our separate <a href="/refund-policy" className="text-blue-600 dark:text-blue-400 hover:underline">Refund Policy</a>. Please review it carefully before making a purchase.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">6. Acceptable Use Policy</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You agree to use BioBuddy only for lawful purposes and in accordance with these Terms. You agree NOT to:
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">6.1 Prohibited Activities</h3>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li><strong>Share accounts:</strong> Each subscription is for individual use only. Do not share your account credentials</li>
              <li><strong>Abuse the service:</strong> Do not create excessive requests, spam, or attempt to overwhelm our servers</li>
              <li><strong>Scrape or copy content:</strong> Do not use automated tools to extract, scrape, or copy content from BioBuddy</li>
              <li><strong>Reverse engineer:</strong> Do not attempt to reverse engineer, decompile, or extract source code from our Service</li>
              <li><strong>Resell or redistribute:</strong> Do not resell, redistribute, or commercialize content generated by BioBuddy</li>
              <li><strong>Violate laws:</strong> Do not use BioBuddy for any illegal activities or to promote illegal activities</li>
              <li><strong>Infringe rights:</strong> Do not use the Service in ways that infringe on others&apos; intellectual property or privacy rights</li>
              <li><strong>Harm others:</strong> Do not harass, threaten, or harm other users or BioBuddy staff</li>
              <li><strong>Circumvent limits:</strong> Do not attempt to bypass usage limits, paywalls, or security measures</li>
              <li><strong>Impersonate:</strong> Do not impersonate others or misrepresent your affiliation with any person or entity</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">6.2 Content Standards</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              When using BioBuddy, you must not input or attempt to generate content that is:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Illegal, harmful, or promotes illegal activities</li>
              <li>Abusive, threatening, or harassing</li>
              <li>Sexually explicit or pornographic</li>
              <li>Violates others&apos; privacy or personal rights</li>
              <li>Contains malware, viruses, or harmful code</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">6.3 Enforcement</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We reserve the right to investigate and take appropriate action against users who violate this Acceptable Use Policy, including suspension or termination of accounts without refund.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">7. Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">7.1 BioBuddy&apos;s Intellectual Property</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              All content, features, and functionality of BioBuddy (including but not limited to software, text, graphics, logos, icons, images, and the overall platform design) are owned by BioBuddy and protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You may not copy, modify, distribute, sell, or lease any part of our Service without explicit written permission.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">7.2 Your Content and Input</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You retain ownership of any topics, questions, or other content you input into BioBuddy (&quot;User Input&quot;). By using our Service, you grant BioBuddy a limited, non-exclusive license to use your User Input solely to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Generate concept maps and educational content for you</li>
              <li>Improve and optimize our Service</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">7.3 Generated Content License</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Concept maps and educational content generated by BioBuddy&apos;s AI are licensed to you for personal, non-commercial educational use. You may:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>View, download, and print generated content for personal study</li>
              <li>Edit and customize concept maps for your learning</li>
              <li>Use generated content in your coursework (with proper attribution if required by your institution)</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You may NOT:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Sell, license, or commercialize generated content</li>
              <li>Claim generated content as your own original work</li>
              <li>Redistribute generated content to others (except as part of legitimate academic collaboration)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">8. Service Availability and Modifications</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">8.1 Service Availability</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              BioBuddy is provided on an &quot;as is&quot; and &quot;as available&quot; basis. While we strive to maintain 99.9% uptime:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>We do not guarantee uninterrupted or error-free service</li>
              <li>The Service may be temporarily unavailable for maintenance or technical issues</li>
              <li>We&apos;ll make reasonable efforts to provide advance notice of scheduled maintenance</li>
              <li>We are not liable for any downtime, delays, or service interruptions</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">8.2 Service Modifications</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Modify, update, or discontinue any feature or aspect of BioBuddy at any time</li>
              <li>Change usage limits, features, or functionality</li>
              <li>Add new features or remove existing ones</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We&apos;ll make reasonable efforts to notify users of significant changes, but we are not liable for any modifications to the Service.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">8.3 Third-Party Services</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              BioBuddy relies on third-party services (Anthropic API, Supabase, etc.). We are not responsible for the availability, accuracy, or performance of these third-party services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">9. Account Termination</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">9.1 Your Right to Cancel</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You may cancel your BioBuddy subscription or delete your account at any time:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li><strong>Monthly subscriptions:</strong> Cancel anytime from your Dashboard or by emailing us. Your access continues until the end of your current billing period</li>
              <li><strong>Account deletion:</strong> Email faliqwicaksono21@gmail.com to permanently delete your account and data</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">9.2 Our Right to Suspend or Terminate</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We reserve the right to suspend or terminate your account immediately, without prior notice or liability, if:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>You violate these Terms of Service</li>
              <li>You violate our Acceptable Use Policy</li>
              <li>You engage in fraudulent or illegal activities</li>
              <li>Your account shows signs of abuse or security compromise</li>
              <li>We&apos;re required to do so by law</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Accounts terminated for violations are not eligible for refunds.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">9.3 Effect of Termination</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Upon termination of your account:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Your access to BioBuddy will immediately cease</li>
              <li>Your data may be permanently deleted within 30 days</li>
              <li>You will no longer be able to access saved content or generated maps</li>
              <li>Certain provisions of these Terms (payment obligations, liability limitations, dispute resolution) survive termination</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">10. Disclaimers and Limitation of Liability</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">10.1 Educational Tool Disclaimer</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              BioBuddy is an educational study aid. While we strive for accuracy:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>AI-generated content may contain errors, inaccuracies, or omissions</li>
              <li>Content should not replace official course materials or professional advice</li>
              <li>Always verify information with authoritative sources</li>
              <li>We make no guarantees about the accuracy, completeness, or currency of content</li>
              <li>BioBuddy is not a substitute for professional medical, scientific, or academic advice</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">10.2 No Warranty</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Warranties of merchantability or fitness for a particular purpose</li>
              <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
              <li>Warranties regarding the accuracy or reliability of content</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">10.3 Limitation of Liability</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BIOBUDDY AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Lost profits, data, use, goodwill, or other intangible losses</li>
              <li>Damages resulting from your use or inability to use the Service</li>
              <li>Damages resulting from unauthorized access to your account or data</li>
              <li>Damages resulting from errors, mistakes, or inaccuracies in content</li>
              <li>Damages resulting from third-party services we rely on</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS SHALL NOT EXCEED THE AMOUNT YOU PAID TO BIOBUDDY IN THE 12 MONTHS PRECEDING THE CLAIM, OR $100 USD, WHICHEVER IS LESS.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">10.4 Indemnification</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              You agree to indemnify and hold harmless BioBuddy, its operators, and affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">11. Dispute Resolution and Governing Law</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">11.1 Governing Law</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              These Terms are governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">11.2 Dispute Resolution</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              If you have a dispute with BioBuddy:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li><strong>Informal Resolution:</strong> First, contact us at faliqwicaksono21@gmail.com to attempt to resolve the issue informally</li>
              <li><strong>Formal Dispute:</strong> If informal resolution fails, disputes shall be resolved in the courts of the United Kingdom</li>
              <li><strong>No Class Actions:</strong> You agree to resolve disputes on an individual basis and waive any right to participate in class actions</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">11.3 Jurisdiction</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              You agree to submit to the personal and exclusive jurisdiction of the courts located in the United Kingdom for the resolution of any disputes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">12. Changes to Terms</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We may update these Terms from time to time. When we make changes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>We&apos;ll update the &quot;Last updated&quot; date at the top</li>
              <li>For significant changes, we&apos;ll notify you via email or a prominent notice on BioBuddy</li>
              <li>Your continued use after changes take effect constitutes acceptance of the new Terms</li>
              <li>If you don&apos;t agree with the new Terms, you must stop using BioBuddy and cancel your subscription</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We recommend reviewing these Terms periodically to stay informed of updates.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">13. Miscellaneous</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">13.1 Entire Agreement</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              These Terms, along with our Privacy Policy and Refund Policy, constitute the entire agreement between you and BioBuddy.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">13.2 Severability</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">13.3 Waiver</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">13.4 Assignment</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You may not assign or transfer these Terms or your account without our written consent. We may assign these Terms without restriction.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">13.5 Force Majeure</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We are not liable for any failure to perform due to circumstances beyond our reasonable control, including natural disasters, war, terrorism, riots, or internet failures.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">14. Contact Information</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-4">
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Email:</strong> <a href="mailto:faliqwicaksono21@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">faliqwicaksono21@gmail.com</a>
              </p>
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Service Name:</strong> BioBuddy
              </p>
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Operator:</strong> Arya Wicaksono
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Location:</strong> United Kingdom
              </p>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We aim to respond to all inquiries within 2-3 business days.
            </p>
          </section>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-12">
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              By using BioBuddy, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

