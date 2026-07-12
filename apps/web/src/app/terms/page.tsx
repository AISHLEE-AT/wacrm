import React from 'react';

export const metadata = {
  title: 'Terms of Service | TradO',
  description: 'Terms of Service for the TradO application.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Effective Date: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert mx-auto">
          <p>
            Welcome to TradO (accessible at <a href="https://mywhatsapp-two.vercel.app" className="text-primary hover:underline">https://mywhatsapp-two.vercel.app</a>). 
            By accessing or using our application, you agree to be bound by these Terms of Service.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By creating an account or using our platform, you agree to these terms. If you do not agree, you may not use the service.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Service</h2>
          <p>
            TradO provides tools for managing WhatsApp communications via the WhatsApp Business API, including shared inbox, contact management, sales pipelines, and automations. We reserve the right to modify or discontinue any part of the service at our discretion.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. User Responsibilities</h2>
          <p>As a user, you agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate information when creating an account.</li>
            <li>Maintain the confidentiality of your account credentials.</li>
            <li>Use the service only for lawful purposes and in compliance with WhatsApp's Business terms and policies.</li>
            <li>Not use the service to send spam or unsolicited messages.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Third-Party Integrations</h2>
          <p>
            Our service integrates with third-party providers, primarily the Meta WhatsApp Business API and Supabase. Your use of these third-party integrations is governed by their respective terms of service. We are not responsible for the availability or actions of these third parties.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Limitation of Liability</h2>
          <p>
            In no event shall TradO or its creators be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your access to or use of our application.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Changes to Terms</h2>
          <p>
            We may revise these Terms of Service from time to time. The most current version will always be available on this page. By continuing to use the service after changes become effective, you agree to be bound by the revised terms.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at: <a href="mailto:aishleeraadee@gmail.com" className="text-primary hover:underline">aishleeraadee@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
