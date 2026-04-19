"use client";

import { useState, useEffect, useRef } from 'react';
import { User, Shield, Bell, Monitor, Camera, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

type Tab = 'profile' | 'security' | 'notifications' | 'preferences';

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { theme, setTheme } = useTheme();
  const avatarUrlRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState<any>({
    name: '',
    bio: '',
    avatarUrl: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        setProfileData({
          name: data.name || '',
          bio: data.bio || '',
          avatarUrl: data.avatarUrl || '',
          email: data.email || ''
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileData.name,
          bio: profileData.bio,
          avatarUrl: profileData.avatarUrl
        })
      });
      if (res.ok) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const downscaleImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = dataUrl;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
       toast.error("Please select an image file.");
       return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      const downscaled = await downscaleImage(result);
      setProfileData({ ...profileData, avatarUrl: downscaled });
      toast.success("Image selected and optimized!");
    };
    reader.readAsDataURL(file);
  };

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
              <h2 className="text-xl font-bold text-text-primary mb-6">Profile Settings</h2>
              
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b border-border">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-primary-100 border-2 border-dashed border-primary-300 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-primary-500 transition-colors">
                    {profileData.avatarUrl ? (
                      <img src={profileData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="text-primary-400" />
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-2 bg-primary-500 text-white rounded-xl shadow-lg border-2 border-white cursor-pointer hover:bg-primary-600 transition-colors"
                  >
                    <Camera size={16} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex-1 space-y-1 text-center md:text-left">
                  <h3 className="font-bold text-text-primary">Profile Picture</h3>
                  <p className="text-xs text-text-secondary max-w-xs">Change your photo to help your peers recognize you. Paste a direct image URL below.</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSave}>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Avatar URL</label>
                  <input 
                    ref={avatarUrlRef}
                    type="url" 
                    value={profileData.avatarUrl} 
                    onChange={(e) => setProfileData({...profileData, avatarUrl: e.target.value})}
                    placeholder="https://example.com/photo.jpg" 
                    className="w-full h-11 px-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Display Name</label>
                  <input 
                    type="text" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full h-11 px-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Bio</label>
                  <textarea 
                    value={profileData.bio} 
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Tell your peers a bit about yourself..."
                    className="w-full min-h-[100px] p-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm resize-none" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Email Address</label>
                  <input type="email" value={profileData.email} disabled className="w-full h-11 px-3 rounded-lg border border-border bg-bg-secondary text-text-muted cursor-not-allowed" />
                </div>

                <div className="pt-4 border-t border-border mt-6 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSaving || isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 active:scale-95 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-70"
                  >
                    {isSaving && <Loader2 size={18} className="animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Profile Changes'}
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