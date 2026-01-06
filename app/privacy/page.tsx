import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Genpire",
  description: "Privacy Policy for Genpire - AI-powered product creation platform",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-zinc-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-cream/20 rounded-lg p-6 mb-8">
              <p className="text-gray-700 leading-relaxed">
                At Genpire, we respect your privacy and are committed to protecting your personal information. This
                Privacy Policy explains how we collect, use, and safeguard your data.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">1. Information We Collect</h2>

              <h3 className="text-xl font-medium text-zinc-900 mb-3">Personal Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Name and email address</li>
                <li>Profile information and preferences</li>
                <li>Payment and billing information</li>
                <li>Communication records</li>
              </ul>

              <h3 className="text-xl font-medium text-zinc-900 mb-3">Product and Project Data</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Product ideas and descriptions</li>
                <li>Technical specifications and designs</li>
                <li>Images and files you upload</li>
                <li>Project collaboration data</li>
              </ul>

              <h3 className="text-xl font-medium text-zinc-900 mb-3">Usage Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Usage patterns and preferences</li>
                <li>Performance and analytics data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide and improve our AI-powered services</li>
                <li>Generate technical specifications and product visualizations</li>
                <li>Connect you with suitable manufacturers</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send important updates and notifications</li>
                <li>Provide customer support</li>
                <li>Analyze usage patterns to enhance user experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in these limited circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  <strong>With Manufacturers:</strong> When you choose to connect with manufacturers, we share relevant
                  project details
                </li>
                <li>
                  <strong>Service Providers:</strong> With trusted third-party services that help us operate our
                  platform
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with mergers or acquisitions
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication</li>
                <li>Secure cloud infrastructure</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">5. Your Rights and Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  <strong>Access:</strong> Request a copy of your personal information
                </li>
                <li>
                  <strong>Correct:</strong> Update or correct inaccurate information
                </li>
                <li>
                  <strong>Delete:</strong> Request deletion of your personal information
                </li>
                <li>
                  <strong>Port:</strong> Export your data in a portable format
                </li>
                <li>
                  <strong>Opt-out:</strong> Unsubscribe from marketing communications
                </li>
                <li>
                  <strong>Restrict:</strong> Limit how we process your information
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Essential cookies for platform functionality</li>
                <li>Analytics cookies to understand usage patterns</li>
                <li>Preference cookies to remember your settings</li>
                <li>Marketing cookies for personalized content</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">7. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your information may be processed in countries other than your own. We ensure appropriate safeguards are
                in place for international transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our service is not intended for children under 13. We do not knowingly collect personal information from
                children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or
                through our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about this Privacy Policy or want to exercise your rights:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">General Contact: support@genpire.com</p>
                <p className="text-gray-700">Privacy: support@genpire.com</p>
                <p className="text-gray-700">Data Protection Officer: support@genpire.com</p>
                <p className="text-gray-700">Address: Tel Aviv, Israel</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
