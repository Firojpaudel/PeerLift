"use client";

import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";

export function NavbarUser() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full border border-border-strong overflow-hidden flex items-center justify-center bg-bg-secondary cursor-pointer hover:border-primary-500 active:scale-95 transition-all text-text-secondary"
      >
        {session?.user?.image ? (
            <Avatar src={session.user.image} alt={session.user.name || "User"} size="md" fallback={session.user.name?.[0] || "U"} />
        ) : (
            <User size={18} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-bg-elevated border border-border rounded-lg shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium text-text-primary truncate">{session?.user?.name || "User"}</p>
            <p className="text-xs text-text-muted truncate">{session?.user?.email}</p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors"
          >
            <User size={16} className="text-text-muted" />
            Profile
          </Link>
          <Link
            href="/sessions/chat"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors"
          >
            <MessageSquare size={16} className="text-text-muted" />
            Chat
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors"
          >
            <Settings size={16} className="text-text-muted" />
            Settings
          </Link>
          <div className="h-px bg-border my-1"></div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
