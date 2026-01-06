import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Genpire",
  description: "Terms of Service for Genpire - AI-powered product creation platform",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-zinc-900 mb-4">Terms of Service</h1>
            <p className="text-lg text-zinc-900/70">Last updated: January 16, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-lg p-8 border border-taupe/30 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-zinc-900/80 leading-relaxed">
                  By accessing and using Genpire ("the Service"), you accept and agree to be bound by the terms and
                  provision of this agreement. If you do not agree to abide by the above, please do not use this
                  service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-4">2. Description of Service</h2>
                <p className="text-zinc-900/80 leading-relaxed">
                  Genpire is an AI-powered platform that helps users create technical specifications (tech packs) for
                  product manufacturing. Our service includes AI-generated content, editing tools, and export
                  capabilities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-4">3. User Accounts</h2>
                <p className="text-zinc-900/80 leading-relaxed mb-4">
                  To access certain features of the Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-4">4. Payment Terms</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-semibold">
                    ⚠️ IMPORTANT: All purchases are final and non-refundable.
                  </p>
                </div>
                <p className="text-zinc-900/80 leading-relaxed mb-4">
                  Our service operates on a credit-based system. By purchasing credits, you agree to the following:
                </p>
                <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
                  <li>
                    <strong>All sales are final:</strong> We do not offer refunds for subscription fees, credits, or any
                    other services purchased through our platform
                  </li>
                  <li>Credits never expire once purchased</li>
                  <li>Prices are subject to change with notice</li>
                  <li>You are responsible for all charges incurred under your account</li>
                  <li>Payment must be made through our approved payment processors</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-4">5. Intellectual Property Rights</h2>
                <p className="text-zinc-900/80 leading-relaxed mb-4">
                  You retain ownership of your original content and ideas. However:
                </p>
                <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
                  <li>You grant Genpire a limited license to process your content to provide our services</li>
                  <li>AI-generated content is provided "as-is" and you are responsible for its use</li>
                  <li>You may not reverse engineer or attempt to extract our AI models</li>
                  <li>Our platform, technology, and branding remain our intellectual property</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-4">6. User Conduct</h2>
                <p className="text-zinc-900/80 leading-relaxed mb-4">You agree not to use the Service to:</p>
                <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
                  <li>Upload or create content that is illegal, harmful, or violates others' rights</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Use the Service for any unlawful purpose</li>
                  <li>Share your account credentials with others</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-4">7. Privacy and Data Protection</h2>
                <p className="text-zinc-900/80 leading-relaxed">
                  Your privacy is important to us. Our collection and use of personal information is governed by our
                  Privacy Policy, which is incorporated into these Terms by reference. We implement appropriate security
                  measures to protect your data, but cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-4">8. Service Availability</h2>
                <p className="text-zinc-900/80 leading-relaxed">
                  We strive to maintain high availability but do not guarantee uninterrupted service. We may temporarily
                  suspend the Service for maintenance, updates, or other operational reasons. We are not liable for any
                  downtime or service interruptions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-4">9. Disclaimers</h2>
                <p className="text-zinc-900/80 leading-relaxed mb-4">
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR
                  IMPLIED, INCLUDING:
                </p>
                <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
                  <li>Accuracy or completeness of AI-generated content</li>
                  <li>Fitness for a particular purpose</li>
                  <li>Non-infringement of third-party rights</li>
                  <li>Uninterrupted or error-free operation</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-4">10. Limitation of Liability</h2>
                <p className="text-zinc-900/80 leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, GENPIRE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR
                  USE, ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-4">11. Termination</h2>
                <p className="text-zinc-900/80 leading-relaxed">
                  We may terminate or suspend your account and access to the Service at our sole discretion, without
                  prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or
                  third parties, or for any other reason. Upon termination, your right to use the Service will cease
                  immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-4">12. Changes to Terms</h2>
                <p className="text-zinc-900/80 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of significant changes
                  via email or through the Service. Your continued use of the Service after such modifications
                  constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-4">13. Governing Law</h2>
                <p className="text-zinc-900/80 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
                  without regard to its conflict of law provisions. Any disputes arising under these Terms shall be
                  subject to the exclusive jurisdiction of the courts in [Your Jurisdiction].
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-4">14. Contact Information</h2>
                <p className="text-zinc-900/80 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-cream/50 rounded-lg p-4 mt-4">
                  <p className="text-zinc-900 font-medium">Email: support@genpire.com</p>
                  <p className="text-zinc-900 font-medium">Address: [Your Business Address]</p>
                </div>
              </section>

              <div className="border-t border-taupe/30 pt-8 mt-8">
                <p className="text-zinc-900/60 text-sm text-center">
                  By using Genpire, you acknowledge that you have read, understood, and agree to be bound by these Terms
                  of Service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
