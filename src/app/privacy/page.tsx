import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-bg-elevated border border-border rounded-3xl p-8 sm:p-12 shadow-xl">
        <h1 className="text-4xl font-display font-extrabold mb-8 tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
          Privacy Policy
        </h1>
        <p className="text-text-muted text-sm text-center mb-8">Last Updated: July 4, 2026</p>

        <div className="space-y-8 text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information to provide better services to all our users. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Information:</strong> When you register, we collect your name,
                username, email, and password. If you sign in using Google, we collect your profile
                picture, email address, and OAuth tokens.
              </li>
              <li>
                <strong>Calendar Access:</strong> If you connect your Google Calendar, we access it
                solely to generate and schedule live Google Meet sessions between users.
              </li>
              <li>
                <strong>Usage Data:</strong> We collect stats on learning and mentoring sessions
                completed on the platform.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">2. How We Use Information</h2>
            <p className="mb-4">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, maintain, and improve the PeerLift peer learning system.</li>
              <li>To facilitate connection and session coordination through Google Meet links.</li>
              <li>To measure learning engagement and track credit transactions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              3. Data Sharing & Security
            </h2>
            <p>
              We do not sell or share your personal data with third parties. All messages,
              credentials, and tokens are protected with industry-standard encryption protocols.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">4. Your Rights & Choices</h2>
            <p>
              You have the right to access, edit, or delete your account information at any time.
              You can disconnect your Google Calendar access from your Google Account settings or by
              removing your linked account in your PeerLift profile.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:firojpaudel@gmail.com" className="text-primary-500 hover:underline">
                firojpaudel@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <a
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
