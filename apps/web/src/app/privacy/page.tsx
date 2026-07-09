import React from 'react';

export const metadata = {
  title: 'Privacy Policy | WhatsApp CRM',
  description: 'Privacy Policy for the WhatsApp CRM application.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Effective Date: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert mx-auto">
          <p>
            Welcome to WhatsApp CRM (accessible at <a href="https://mywhatsapp-two.vercel.app" className="text-primary hover:underline">https://mywhatsapp-two.vercel.app</a>). 
            Your privacy is critically important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our application.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We may collect the following types of information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal Information:</strong> Includes your name, email address, phone numbers, and any other details you provide when registering or interacting with the CRM.</li>
            <li><strong>Communication Data:</strong> Messages, contacts, and broadcast history handled through the WhatsApp Business API integration.</li>
            <li><strong>Usage Data:</strong> Information about how you navigate and use our platform (e.g., login times, features accessed).</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, operate, and maintain the CRM application.</li>
            <li>Facilitate your communications via the WhatsApp API.</li>
            <li>Improve, personalize, and expand our services.</li>
            <li>Understand and analyze how you use our platform.</li>
            <li>Communicate with you for customer service, updates, and related information.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Security and Storage</h2>
          <p>
            We use industry-standard security measures (including secure databases via Supabase) to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security but strive to protect your data using commercially acceptable means.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Third-Party Services</h2>
          <p>
            Our service utilizes third-party services, such as the WhatsApp Business API and Supabase (for database and authentication). These providers have their own privacy policies addressing how they use your information. We encourage you to review their respective privacy policies.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:aishleeraadee@gmail.com" className="text-primary hover:underline">aishleeraadee@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
