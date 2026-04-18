"use client";

import { useState } from 'react';
import { User, Shield, Bell, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

type Tab = 'profile' | 'security' | 'notifications' | 'preferences';

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-4xl mx-auto w-full">
      {/* Sidebar Navigation */}
      <aside className="col-span-1 flex flex-col gap-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors text-left ${
            activeTab === 'profile'
              ? 'bg-bg-elevated text-primary-600 border border-border shadow-sm'
              : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent'
          }`}
        >
          <User size={18} />
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors text-left ${
            activeTab === 'security'
              ? 'bg-bg-elevated text-primary-600 border border-border shadow-sm'
              : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent'
          }`}
        >
          <Shield size={18} />
          Account Security
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors text-left ${
            activeTab === 'notifications'
              ? 'bg-bg-elevated text-primary-600 border border-border shadow-sm'
              : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent'
          }`}
        >
          <Bell size={18} />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors text-left ${
            activeTab === 'preferences'
              ? 'bg-bg-elevated text-primary-600 border border-border shadow-sm'
              : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent'
          }`}
        >
          <Monitor size={18} />
          Preferences
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="col-span-1 lg:col-span-3 space-y-6">
        {activeTab === 'profile' && (
          <>
            <section className="bg-bg-elevated rounded-2xl border border-border p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-text-primary mb-4">Personal Information</h2>
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-secondary">First Name</label>
                    <input type="text" defaultValue="Jane" className="w-full h-11 px-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-secondary">Last Name</label>
                    <input type="text" defaultValue="Doe" className="w-full h-11 px-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Email Address</label>
                  <input type="email" defaultValue="hello@example.com" disabled className="w-full h-11 px-3 rounded-lg border border-border bg-bg-secondary text-text-muted cursor-not-allowed" />
                </div>
                <div className="pt-4 border-t border-border mt-6 flex justify-end">
                  <button type="button" className="px-5 py-2.5 bg-primary-500 text-neutral-0 font-medium rounded-xl hover:bg-primary-600 active:scale-95 transition-all shadow-sm">
                    Save Changes
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-bg-elevated rounded-2xl border border-border p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-text-primary mb-4">Video Link (Asynchronous Teaching)</h2>
              <p className="text-sm text-text-secondary mb-4">Provide a link to a default pre-recorded video or playlist for asynchronous learners (e.g., Unlisted YouTube, Google Drive).</p>
              <form className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Video URL</label>
                  <input type="url" placeholder="https://youtube.com/..." className="w-full h-11 px-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="button" className="px-5 py-2.5 bg-bg-secondary text-text-primary border border-border font-medium rounded-xl hover:bg-bg-primary hover:border-primary-400 active:scale-95 transition-all">
                    Save Video Link
                  </button>
                </div>
              </form>
            </section>
          </>
        )}

        {activeTab === 'security' && (
          <section className="bg-bg-elevated rounded-2xl border border-border p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-text-primary mb-4">Account Security</h2>
            <form className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full h-11 px-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full h-11 px-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="w-full h-11 px-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
              </div>
              <div className="pt-4 border-t border-border mt-6 flex justify-end">
                <button type="button" className="px-5 py-2.5 bg-primary-500 text-neutral-0 font-medium rounded-xl hover:bg-primary-600 active:scale-95 transition-all shadow-sm">
                  Update Password
                </button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'notifications' && (
          <section className="bg-bg-elevated rounded-2xl border border-border p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-text-primary mb-4">Notification Preferences</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-text-primary">Email Notifications</h3>
                  <p className="text-sm text-text-secondary">Receive daily digests and important updates via email.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <h3 className="font-medium text-text-primary">Session Reminders</h3>
                  <p className="text-sm text-text-secondary">Get notified 1 hour before an upcoming session starts.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <h3 className="font-medium text-text-primary">New Matches</h3>
                  <p className="text-sm text-text-secondary">Notifies you when someone posts a skill you are looking for.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'preferences' && (
          <section className="bg-bg-elevated rounded-2xl border border-border p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-text-primary mb-4">Application Preferences</h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-text-primary">Theme Appearance</h3>
                  <p className="text-sm text-text-secondary">Select your preferred color theme for the interface.</p>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => setTheme('light')}
                     className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${theme === 'light' ? 'bg-primary-50 text-primary-600 border-primary-200' : 'bg-bg-primary text-text-secondary border-border hover:bg-bg-secondary'}`}>
                     Light
                   </button>
                   <button 
                     onClick={() => setTheme('dark')}
                     className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${theme === 'dark' ? 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-900/30' : 'bg-bg-primary text-text-secondary border-border hover:bg-bg-secondary'}`}>
                     Dark
                   </button>
                   <button 
                     onClick={() => setTheme('system')}
                     className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${theme === 'system' || !theme ? 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-900/30' : 'bg-bg-primary text-text-secondary border-border hover:bg-bg-secondary'}`}>
                     System
                   </button>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <div>
                  <h3 className="font-medium text-text-primary">Timezone</h3>
                  <p className="text-sm text-text-secondary">Used for scheduling your mentoring sessions.</p>
                </div>
                <select className="w-full md:w-1/2 h-11 px-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>EST (Eastern Standard Time)</option>
                  <option>PST (Pacific Standard Time)</option>
                  <option>GMT (Greenwich Mean Time)</option>
                </select>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}