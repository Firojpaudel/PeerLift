"use client";

import { useState, useEffect, useRef } from 'react';
import { User, Shield, Bell, Monitor, Camera, Loader2, Plus, Trash2, BookOpen, Award } from 'lucide-react';
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

  // --- Skills Management State ---
  const [skillsOffered, setSkillsOffered] = useState<any[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Add Skill Form state
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedSkillType, setSelectedSkillType] = useState<'teaching' | 'learning'>('teaching');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('INTERMEDIATE');
  const [selectedSkillNote, setSelectedSkillNote] = useState('');

  // Synchronize Tab from URL Search Params (?tab=profile)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['profile', 'security', 'notifications', 'preferences'].includes(tabParam)) {
        setActiveTab(tabParam as Tab);
      }
    }
  }, []);

  // Fetch Profile Data
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

  // Fetch Skills Data
  useEffect(() => {
    fetch('/api/user/skills')
      .then(res => res.json())
      .then(data => {
        if (data.allSkills) {
          setAllSkills(data.allSkills);
          if (data.allSkills.length > 0) {
            setSelectedSkillId(data.allSkills[0].id);
          }
        }
        if (data.skillsOffered) setSkillsOffered(data.skillsOffered);
        if (data.skillsWanted) setSkillsWanted(data.skillsWanted);
        setIsLoadingSkills(false);
      })
      .catch(err => {
        console.error("Failed to fetch skills:", err);
        setIsLoadingSkills(false);
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

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) {
      toast.error("Please select a skill to add.");
      return;
    }
    setIsAddingSkill(true);
    try {
      const res = await fetch('/api/user/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: selectedSkillId,
          type: selectedSkillType,
          level: selectedSkillLevel,
          note: selectedSkillNote
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (selectedSkillType === 'teaching') {
          setSkillsOffered(prev => [...prev, data]);
        } else {
          setSkillsWanted(prev => [...prev, data]);
        }
        setSelectedSkillNote('');
        toast.success("Skill added to profile successfully!");
      } else {
        toast.error(data.error || "Failed to add skill.");
      }
    } catch (err) {
      toast.error("Failed to add skill.");
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleDeleteSkill = async (userSkillId: string, type: 'teaching' | 'learning') => {
    try {
      const res = await fetch(`/api/user/skills?id=${userSkillId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (type === 'teaching') {
          setSkillsOffered(prev => prev.filter(s => s.id !== userSkillId));
        } else {
          setSkillsWanted(prev => prev.filter(s => s.id !== userSkillId));
        }
        toast.success("Skill removed from profile.");
      } else {
        toast.error("Failed to remove skill.");
      }
    } catch (err) {
      toast.error("Failed to remove skill.");
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 max-w-4xl mx-auto w-full px-4 py-6 md:py-8">
      {/* Sidebar Navigation (Horizontal scroll on mobile, vertical sticky on desktop) */}
      <aside className="col-span-1 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-none shrink-0 lg:sticky lg:top-20 h-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 px-4 py-2.5 lg:py-3 text-sm font-semibold rounded-xl transition-all text-left shrink-0 active:scale-97 ${
            activeTab === 'profile'
              ? 'bg-bg-elevated text-primary-600 border border-border shadow-sm dark:bg-primary-500/10 dark:border-primary-500/20'
              : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent hover:border-border'
          }`}
        >
          <User size={18} />
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-3 px-4 py-2.5 lg:py-3 text-sm font-semibold rounded-xl transition-all text-left shrink-0 active:scale-97 ${
            activeTab === 'security'
              ? 'bg-bg-elevated text-primary-600 border border-border shadow-sm dark:bg-primary-500/10 dark:border-primary-500/20'
              : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent hover:border-border'
          }`}
        >
          <Shield size={18} />
          Account Security
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-3 px-4 py-2.5 lg:py-3 text-sm font-semibold rounded-xl transition-all text-left shrink-0 active:scale-97 ${
            activeTab === 'notifications'
              ? 'bg-bg-elevated text-primary-600 border border-border shadow-sm dark:bg-primary-500/10 dark:border-primary-500/20'
              : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent hover:border-border'
          }`}
        >
          <Bell size={18} />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-3 px-4 py-2.5 lg:py-3 text-sm font-semibold rounded-xl transition-all text-left shrink-0 active:scale-97 ${
            activeTab === 'preferences'
              ? 'bg-bg-elevated text-primary-600 border border-border shadow-sm dark:bg-primary-500/10 dark:border-primary-500/20'
              : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent hover:border-border'
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

            {/* Skills Management Section */}
            <section className="bg-bg-elevated rounded-2xl border border-border p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                <BookOpen className="text-primary-500" size={22} />
                My Skills (Post & Share)
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                Define the skills you can offer to teach other peers and the skills you are actively looking to learn.
              </p>

              {/* Add a Skill Form */}
              <form onSubmit={handleAddSkill} className="bg-bg-secondary/40 border border-border p-5 rounded-2xl space-y-4 mb-8">
                <h3 className="font-bold text-text-primary text-[14px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Plus className="text-primary-500" size={16} />
                  Add a Skill to Profile
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Select Skill</label>
                    <select 
                      value={selectedSkillId} 
                      onChange={(e) => setSelectedSkillId(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                    >
                      {allSkills.map(skill => (
                        <option key={skill.id} value={skill.id}>{skill.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Skill Classification</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSkillType('teaching')}
                        className={`flex-1 h-11 rounded-lg border font-semibold text-xs transition-all ${
                          selectedSkillType === 'teaching'
                            ? 'bg-primary-500 text-white border-primary-500 shadow-sm shadow-primary-500/10 animate-pulse'
                            : 'bg-bg-primary text-text-secondary border-border hover:bg-bg-secondary'
                        }`}
                      >
                        I Can Teach This
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSkillType('learning')}
                        className={`flex-1 h-11 rounded-lg border font-semibold text-xs transition-all ${
                          selectedSkillType === 'learning'
                            ? 'bg-primary-500 text-white border-primary-500 shadow-sm shadow-primary-500/10 animate-pulse'
                            : 'bg-bg-primary text-text-secondary border-border hover:bg-bg-secondary'
                        }`}
                      >
                        I Want to Learn
                      </button>
                    </div>
                  </div>
                </div>

                {selectedSkillType === 'teaching' && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Proficiency Level</label>
                    <select
                      value={selectedSkillLevel}
                      onChange={(e) => setSelectedSkillLevel(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                    >
                      <option value="BEGINNER">Beginner (Basic understanding)</option>
                      <option value="INTERMEDIATE">Intermediate (Comfortable practicing/assisting)</option>
                      <option value="ADVANCED">Advanced (Expert understanding)</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Expertise Details (Optional)</label>
                  <input
                    type="text"
                    value={selectedSkillNote}
                    onChange={(e) => setSelectedSkillNote(e.target.value)}
                    placeholder="e.g. 2 years of building apps, or completed 3 courses."
                    maxLength={200}
                    className="w-full h-11 px-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingSkill || isLoadingSkills || allSkills.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 active:scale-95 transition-all shadow-md shadow-primary-500/10 disabled:opacity-75"
                  >
                    {isAddingSkill ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {isAddingSkill ? "Adding Skill..." : "Add to Profile"}
                  </button>
                </div>
              </form>

              {/* Skills Lists */}
              {isLoadingSkills ? (
                <div className="flex flex-col items-center py-6 justify-center text-text-muted">
                  <Loader2 size={24} className="animate-spin text-primary-500 mb-2" />
                  <span className="text-xs font-semibold">Loading profile skills...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Skills Offered (Teaching) */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-text-primary text-[13px] uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-2">
                      <Award className="text-green-500" size={16} />
                      Skills I Can Teach
                    </h4>
                    {skillsOffered.length === 0 ? (
                      <p className="text-xs text-text-muted italic py-2">You haven&apos;t added any teaching skills yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {skillsOffered.map((us) => (
                          <div key={us.id} className="flex items-start justify-between p-3.5 rounded-xl bg-bg-secondary border border-border group hover:border-green-500/30 transition-all">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-text-primary">{us.skill?.name}</span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  us.level === 'ADVANCED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                  us.level === 'INTERMEDIATE' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                  'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                }`}>
                                  {us.level}
                                </span>
                              </div>
                              {us.note && <p className="text-[11px] text-text-muted italic leading-relaxed">{us.note}</p>}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(us.id, 'teaching')}
                              className="p-1.5 text-text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Delete skill"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Skills Wanted (Learning) */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-text-primary text-[13px] uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-2">
                      <BookOpen className="text-blue-500" size={16} />
                      Skills I Want to Learn
                    </h4>
                    {skillsWanted.length === 0 ? (
                      <p className="text-xs text-text-muted italic py-2">You haven&apos;t added any learning skills yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {skillsWanted.map((us) => (
                          <div key={us.id} className="flex items-start justify-between p-3.5 rounded-xl bg-bg-secondary border border-border group hover:border-blue-500/30 transition-all">
                            <div className="space-y-1">
                              <span className="font-bold text-sm text-text-primary block">{us.skill?.name}</span>
                              {us.note && <p className="text-[11px] text-text-muted italic leading-relaxed">{us.note}</p>}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(us.id, 'learning')}
                              className="p-1.5 text-text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Delete skill"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
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