import { Metadata } from 'next';
import { SettingsClient } from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings - PeerLift',
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col w-full px-4 sm:px-8 py-8 bg-bg-secondary min-h-screen">
      <div className="flex flex-col mb-8 gap-2 max-w-4xl mx-auto w-full mt-4">
        <h1 className="text-3xl font-display font-extrabold text-text-primary tracking-tight">Settings</h1>
        <p className="text-text-secondary text-base">Manage your account preferences and application settings.</p>
      </div>

      <SettingsClient />
    </div>
  );
}