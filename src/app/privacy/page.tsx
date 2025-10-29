'use client';

import { Logo } from "@/components/icons";
import Link from "next/link";
import { useEffect } from "react";

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#2d1b4e]">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-center sm:justify-start bg-[#2d1b4e]/80 backdrop-blur-sm sticky top-0 z-50 border-b border-purple-800">
        <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
          <Logo className="h-6 w-6 text-purple-300" />
          <span className="text-xl font-semibold font-headline text-white">ColoringPics</span>
        </Link>
      </header>
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-8 sm:pt-12 lg:pt-16">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-[#1a0d2e]/90 border border-purple-900 rounded-lg p-6 sm:p-8 md:p-12">
            <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
            <p className="text-purple-300 text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div className="space-y-6 text-purple-100">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
                <p className="mb-2">
                  ColoringPics ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered coloring book generation service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
                <h3 className="text-lg font-medium text-purple-200 mb-2 mt-4">2.1 Information You Provide</h3>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                  <li><strong>Photographs:</strong> Images you upload for conversion into coloring pages</li>
                  <li><strong>Account Information:</strong> Email address, password (if applicable), and profile information</li>
                  <li><strong>Usage Preferences:</strong> Difficulty settings, style preferences, and customization options</li>
                </ul>
                
                <h3 className="text-lg font-medium text-purple-200 mb-2 mt-4">2.2 Automatically Collected Information</h3>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                  <li><strong>Usage Data:</strong> How you interact with the Service, pages visited, features used</li>
                  <li><strong>Device Information:</strong> Browser type, device type, operating system, IP address</li>
                  <li><strong>Cookies and Tracking:</strong> We use cookies for authentication and to remember your preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
                <p className="mb-2">We use collected information to:</p>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                  <li>Process and convert your uploaded images into coloring book pages using AI technology</li>
                  <li>Provide, maintain, and improve our Service</li>
                  <li>Authenticate your access to the Service</li>
                  <li>Communicate with you about the Service, including updates and support</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Comply with legal obligations and protect our rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Services</h2>
                <p className="mb-2">We use the following third-party services that may process your data:</p>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                  <li><strong>Firebase (Google):</strong> For hosting, storage, and backend services. Subject to Google's Privacy Policy.</li>
                  <li><strong>Google Gemini AI:</strong> For image processing and AI-powered conversion. Images are processed by Google's AI services.</li>
                  <li><strong>Analytics Services:</strong> We may use analytics tools to understand usage patterns (all data anonymized where possible).</li>
                </ul>
                <p className="mb-2">
                  These third parties have access to your data only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Data Storage and Retention</h2>
                <p className="mb-2">
                  <strong>Image Storage:</strong> Uploaded images and generated coloring pages are temporarily stored during processing. We retain data only as long as necessary to provide the Service and comply with legal obligations.
                </p>
                <p className="mb-2">
                  <strong>Deletion:</strong> You may request deletion of your data at any time. We will delete your data within 30 days of receiving a valid request, except where retention is required by law.
                </p>
                <p className="mb-2">
                  <strong>Backup Systems:</strong> Deleted data may persist in backup systems for a limited period before permanent deletion.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. Children's Privacy (COPPA Compliance)</h2>
                <p className="mb-2">
                  Our Service may be used to create coloring books for children; however, we do not knowingly collect personal information from children under 13 years of age without parental consent. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                </p>
                <p className="mb-2">
                  If we learn that we have collected personal information from a child under 13 without parental consent, we will delete that information promptly.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights (GDPR and Similar Laws)</h2>
                <p className="mb-2">Depending on your location, you may have the following rights:</p>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                  <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                  <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong>Restriction:</strong> Request limitation of processing of your data</li>
                  <li><strong>Data Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
                </ul>
                <p className="mb-2">
                  To exercise these rights, please contact us through the Service or using the contact information provided.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">8. Data Security</h2>
                <p className="mb-2">
                  We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                </p>
                <p className="mb-2">Security measures include:</p>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal data on a need-to-know basis</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">9. Cookies and Tracking Technologies</h2>
                <p className="mb-2">
                  We use cookies and similar tracking technologies to maintain your session, remember preferences, and analyze Service usage. You can control cookies through your browser settings; however, disabling cookies may affect Service functionality.
                </p>
                <p className="mb-2">Types of cookies we use:</p>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                  <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">10. International Data Transfers</h2>
                <p className="mb-2">
                  Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using the Service, you consent to the transfer of your information to these countries.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">11. Do Not Track Signals</h2>
                <p className="mb-2">
                  Our Service does not currently respond to "Do Not Track" signals from browsers. We may implement support in the future.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">12. Changes to This Privacy Policy</h2>
                <p className="mb-2">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">13. California Privacy Rights (CCPA)</h2>
                <p className="mb-2">
                  California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, the right to delete personal information, and the right to opt-out of the sale of personal information (we do not sell personal information).
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">14. Contact Us</h2>
                <p className="mb-2">
                  If you have questions about this Privacy Policy or wish to exercise your rights, please contact us through the Service.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-purple-800">
        <p className="text-xs text-purple-300">&copy; 2025 ColoringPics. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/terms" className="text-xs text-purple-300 hover:text-purple-200 hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs text-purple-300 hover:text-purple-200 hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

