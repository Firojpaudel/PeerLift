"use client";

import { UserCircle, Zap, Search, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tracks = [
  {
    id: "profile",
    title: "Profile Mastery",
    description: "Your digital first impression. Add your skills and bio to stand out in the community.",
    icon: <UserCircle className="text-blue-500" size={32} />,
    color: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    link: "/settings/profile",
    steps: ["Add a professional bio", "List at least 1 skill you can teach", "Specify what you're looking to learn"]
  },
  {
    id: "request",
    title: "The Art of the Request",
    description: "Found someone you'd like to learn from? Send a compelling proposal to start your journey.",
    icon: <Zap className="text-amber-500" size={32} />,
    color: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    link: "/explore",
    steps: ["Browse featured matches", "Read their reviews and bio", "Click 'Request Exchange' to propose a trade"]
  },
  {
    id: "explore",
    title: "Skill Exploration",
    description: "Dive into our vast library of experts. Use precision filters to find your perfect knowledge match.",
    icon: <Search className="text-secondary-500" size={32} />,
    color: "bg-secondary-500/10",
    borderColor: "border-secondary-500/20",
    link: "/explore",
    steps: ["Search by skill name", "Filter by category (Tech, Creative, etc.)", "Adjust matching level to your experience"]
  },
  {
    id: "chat",
    title: "AI Sidekick",
    description: "Stuck or need learning advice? Our AI agent is here to guide your PeerLift journey.",
    icon: <MessageSquare className="text-primary-500" size={32} />,
    color: "bg-primary-500/10",
    borderColor: "border-primary-500/20",
    link: "/sessions/chat",
    steps: ["Ask for learning path suggestions", "Get advice on how to structure your sessions", "Quickly find platform features via chat"]
  }
];

export function OnboardingPortal() {
  const [activeTrack, setActiveTrack] = useState(tracks[0]);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-bg-elevated to-bg-secondary rounded-3xl border border-border p-8 md:p-12 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-text-primary tracking-tight mb-4">
              Welcome to <span className="text-primary-500">PeerLift</span>.
            </h2>
            <p className="text-xl text-text-secondary leading-relaxed max-w-xl mx-auto md:mx-0">
              You&apos;re just a few steps away from sharing your expertise and mastering new skills. Let&apos;s get you started.
            </p>
          </div>
          <div className="w-full md:w-auto flex flex-col gap-3 min-w-[280px]">
            <div className="bg-bg-elevated/50 backdrop-blur-sm border border-white/5 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Your Progress</span>
                    <span className="text-primary-500 font-bold font-mono">25%</span>
                </div>
                <div className="w-full bg-bg-secondary h-2.5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "25%" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-primary-500 h-full rounded-full shadow-[0_0_10px_rgba(var(--primary-500-rgb),0.5)]"
                    />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tutorial Tracks */}
      <section>
        <h3 className="text-2xl font-display font-extrabold text-text-primary mb-6 flex items-center gap-3">
            <CheckCircle2 className="text-secondary-500" />
            Getting Started Tracks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            {tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => setActiveTrack(track)}
                className={`p-6 rounded-2xl border transition-all duration-300 text-left flex items-start gap-5 group
                  ${activeTrack.id === track.id 
                    ? "bg-bg-elevated border-primary-500/50 shadow-lg scale-[1.02]" 
                    : "bg-bg-elevated/40 border-border hover:border-text-muted/30"}`}
              >
                <div className={`p-3 rounded-xl ${track.color} group-hover:scale-110 transition-transform`}>
                  {track.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-text-primary text-lg mb-1">{track.title}</h4>
                  <p className="text-sm text-text-secondary line-clamp-1">{track.description}</p>
                </div>
                <ArrowRight className={`mt-1 transition-transform ${activeTrack.id === track.id ? "text-primary-500 translate-x-1" : "text-text-muted opacity-0 group-hover:opacity-100"}`} size={20} />
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
                key={activeTrack.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-bg-elevated rounded-3xl border border-border p-8 shadow-sm flex flex-col justify-between"
            >
                <div>
                    <div className={`inline-flex p-4 rounded-2xl ${activeTrack.color} mb-6`}>
                        {activeTrack.icon}
                    </div>
                    <h4 className="text-2xl font-display font-bold text-text-primary mb-3">{activeTrack.title}</h4>
                    <p className="text-text-secondary mb-8 leading-relaxed italic border-l-4 border-primary-500/20 pl-4">
                        &quot;{activeTrack.description}&quot;
                    </p>
                    
                    <div className="space-y-4">
                        <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Next Steps</p>
                        {activeTrack.steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-6 h-6 rounded-full border-2 border-primary-500/30 text-[10px] font-bold flex items-center justify-center text-primary-500 shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                    {i + 1}
                                </div>
                                <span className="text-text-primary group-hover:translate-x-1 transition-transform">{step}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Link href={activeTrack.link} className="mt-12 inline-flex items-center justify-center gap-2 bg-text-primary text-bg-primary font-bold px-8 py-4 rounded-2xl hover:bg-primary-500 hover:text-white transition-all active:scale-95 shadow-lg group">
                    Start this Track
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
