'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Bell, Star, Menu, X, LogOut, User, Settings } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NavbarUser } from '@/components/layout/NavbarUser';
import { Avatar } from '@/components/ui/Avatar';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [credits, setCredits] = useState<number | null>(null);

  // Fetch actual user credits dynamically
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/user/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.credits === 'number') {
            setCredits(data.credits);
          }
        })
        .catch((err) => console.error('Error fetching navbar profile:', err));
    } else {
      setCredits(null);
    }
  }, [session?.user?.id, pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Support programmatic toggle during tutorial tours
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    window.addEventListener('openMobileNav', handleOpen);
    window.addEventListener('closeMobileNav', handleClose);
    return () => {
      window.removeEventListener('openMobileNav', handleOpen);
      window.removeEventListener('closeMobileNav', handleClose);
    };
  }, []);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/explore', label: 'Explore', id: 'nav-explore-button' },
    { href: '/requests', label: 'Requests', id: 'nav-requests-button' },
    { href: '/sessions', label: 'Sessions', id: 'nav-sessions-button' },
    { href: '/sessions/chat', label: 'Chat', id: 'ai-tutor-sidebar-button' },
  ];

  return (
    <>
      <nav className="h-16 border-b border-border bg-bg-elevated flex items-center px-6 md:px-8 shrink-0 shadow-sm sticky top-0 z-50 transition-colors">
        <Link
          href="/dashboard"
          className="flex items-center gap-0 font-display font-extrabold text-2xl text-primary-600 tracking-tight hover:opacity-90 active:scale-95 transition-all"
        >
          <img
            src="/icon-light.png"
            alt="PeerLift Logo"
            className="w-8 h-8 rounded-lg block dark:hidden object-contain"
          />
          <img
            src="/icon-dark.png"
            alt="PeerLift Logo"
            className="w-8 h-8 rounded-lg hidden dark:block object-contain"
          />
          <span className="-ml-1.5">eerLift</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="ml-auto hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              id={link.id}
              className={`hover:text-primary-600 active:scale-95 transition-all ${
                pathname === link.href ? 'text-primary-600 font-semibold' : 'text-text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="h-6 w-px bg-border mx-2 hidden md:block"></div>

          <div className="flex items-center gap-1.5 text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full text-xs font-bold font-mono hover:bg-primary-100 transition-all cursor-default">
            <Star size={14} fill="currentColor" />
            <span>{credits !== null ? `${credits} Credits` : 'Credits'}</span>
          </div>

          <div className="h-6 w-px bg-border mx-2 hidden md:block"></div>

          <ThemeToggle />

          <Link
            href="/requests"
            className="relative text-text-secondary hover:text-primary-600 active:scale-95 transition-all p-2 rounded-full hover:bg-bg-secondary"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-bg-elevated"></span>
          </Link>

          <NavbarUser />
        </div>

        {/* Mobile menu trigger */}
        <div className="ml-auto flex items-center gap-3 md:hidden">
          <ThemeToggle />

          <Link
            href="/requests"
            className="relative text-text-secondary active:scale-95 transition-all p-2 rounded-full hover:bg-bg-secondary"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-bg-elevated"></span>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-text-primary hover:bg-bg-secondary active:scale-90 transition-all rounded-xl border border-border bg-bg-elevated shadow-xs"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-bg-elevated/95 backdrop-blur-lg border-l border-border z-50 shadow-2xl p-6 md:hidden flex flex-col transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="font-display font-extrabold text-xl text-primary-600">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary active:scale-90 transition-all rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card on Mobile */}
        {session?.user && (
          <div className="flex items-center gap-3 p-4 bg-bg-secondary/60 border border-border rounded-2xl mb-6 shadow-xs">
            <div className="w-11 h-11 rounded-full border border-border-strong overflow-hidden flex items-center justify-center bg-bg-secondary shrink-0">
              {session.user.image ? (
                <Avatar
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  size="md"
                  fallback={session.user.name?.[0] || 'U'}
                />
              ) : (
                <User size={18} className="text-text-muted" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-text-primary truncate">{session.user.name}</p>
              <p className="text-xs text-text-muted truncate">{session.user.email}</p>
            </div>
          </div>
        )}

        {/* Credits Balance Card on Mobile */}
        <div className="bg-gradient-to-r from-primary-500 to-amber-600 p-4 rounded-2xl text-white shadow-md flex items-center justify-between mb-6 active:scale-[0.98] transition-all">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-full">
              <Star size={18} fill="currentColor" className="text-amber-100" />
            </div>
            <div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">
                Your Balance
              </p>
              <p className="text-lg font-display font-extrabold text-white">
                {credits !== null ? `${credits} Credits` : 'Credits'}
              </p>
            </div>
          </div>
          <Link href="/explore" onClick={() => setIsOpen(false)}>
            <button className="bg-white text-amber-600 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm hover:scale-105 transition-transform">
              Earn
            </button>
          </Link>
        </div>

        {/* Navigation Links List */}
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              id={link.id ? `${link.id}-mobile` : undefined}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all active:scale-[0.97] ${
                pathname === link.href
                  ? 'bg-primary-50 text-primary-600 border border-primary-100 dark:bg-primary-500/10 dark:border-primary-500/20'
                  : 'text-text-primary hover:bg-bg-secondary hover:text-primary-600'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="h-px bg-border my-4"></div>

          {/* Additional User Links */}
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-text-primary rounded-xl hover:bg-bg-secondary hover:text-primary-600 active:scale-[0.97] transition-all"
          >
            <User size={18} className="text-text-muted" />
            Profile Details
          </Link>
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-text-primary rounded-xl hover:bg-bg-secondary hover:text-primary-600 active:scale-[0.97] transition-all"
          >
            <Settings size={18} className="text-text-muted" />
            Account Settings
          </Link>
        </div>

        {/* Logout at bottom */}
        {session && (
          <div className="border-t border-border pt-4 mt-auto">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-500 bg-red-500/5 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl active:scale-[0.97] transition-all"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
