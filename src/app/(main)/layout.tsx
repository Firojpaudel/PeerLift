import Link from "next/link";
import { Bell, Star } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NavbarUser } from "@/components/layout/NavbarUser";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      {/* Top Navbar */}
      <nav className="h-16 border-b border-border bg-bg-elevated flex items-center px-8 shrink-0 shadow-sm sticky top-0 z-50 transition-colors">
        <Link href="/dashboard" className="font-display font-extrabold text-2xl text-primary-600 tracking-tight hover:opacity-90 active:scale-95 transition-all">
          PeerLift
        </Link>
        <div className="ml-auto hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="text-text-primary hover:text-primary-600 active:scale-95 transition-all">Dashboard</Link>
          <Link href="/explore" id="nav-explore-button" className="text-text-primary hover:text-primary-600 active:scale-95 transition-all">Explore</Link>
          <Link href="/requests" id="nav-requests-button" className="text-text-primary hover:text-primary-600 active:scale-95 transition-all">Requests</Link>
          <Link href="/sessions" id="nav-sessions-button" className="text-text-primary hover:text-primary-600 active:scale-95 transition-all">Sessions</Link>
          <Link href="/sessions/chat" id="ai-tutor-sidebar-button" className="text-text-primary hover:text-primary-600 active:scale-95 transition-all">Chat</Link>
          
          <div className="h-6 w-px bg-border mx-2 hidden md:block"></div>
          
          <div className="flex items-center gap-1.5 text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full text-xs font-bold font-mono hover:bg-primary-100 transition-colors cursor-default">
            <Star size={14} fill="currentColor" />
            <span>100 Credits</span>
          </div>

          <div className="h-6 w-px bg-border mx-2 hidden md:block"></div>

          <ThemeToggle />

          <Link href="/requests" className="relative text-text-secondary hover:text-primary-600 active:scale-95 transition-all p-2 rounded-full hover:bg-bg-secondary">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-bg-elevated"></span>
          </Link>
          
          <NavbarUser />
        </div>
      </nav>

      {/* Main viewport */}
      <div className="flex flex-1 overflow-hidden transition-colors">
        {children}
      </div>
    </div>
  )
}
