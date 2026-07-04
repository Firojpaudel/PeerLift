import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-bg-elevated border border-border rounded-3xl p-8 sm:p-12 shadow-xl">
        <h1 className="text-4xl font-display font-extrabold mb-8 tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
          Terms of Service
        </h1>
        <p className="text-text-muted text-sm text-center mb-8">Last Updated: July 4, 2026</p>

        <div className="space-y-8 text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using PeerLift, you agree to comply with and be bound by these Terms
              of Service. If you do not agree to these terms, you should not access or use the
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">2. Description of Service</h2>
            <p>
              PeerLift is a peer-to-peer skill-sharing platform. We provide tools for users to offer
              skills, request learning sessions, connect via real-time chat, and hold scheduled
              online meetings using automatically generated Google Meet links.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              3. User Accounts & Responsibilities
            </h2>
            <p className="mb-4">When creating an account:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You agree to provide accurate and complete registration details.</li>
              <li>You are responsible for keeping your credentials and sessions secure.</li>
              <li>
                You agree not to engage in harassment, abuse, or any behavior that violates the
                collaborative nature of the platform.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              4. Google Calendar & Third-Party Services
            </h2>
            <p>
              By linking your Google account, you grant PeerLift permission to interface with your
              Google Calendar for the sole purpose of scheduling meetings. PeerLift does not modify,
              read, or delete calendar events unrelated to PeerLift sessions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              5. Credit System & Transactions
            </h2>
            <p>
              PeerLift operates on a peer-to-peer credit system. Credits are awarded for teaching
              sessions and deducted for learning sessions. Credits hold no monetary value and cannot
              be exchanged for currency.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be posted on this
              page with an updated &quot;Last Updated&quot; date.
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
