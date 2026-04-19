"use client";

import { Video, Calendar, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MeetingCardProps {
  content: string;
  isOwn: boolean;
  status?: string;
  createdAt?: string;
}

export function MeetingCard({ content, isOwn }: MeetingCardProps) {
  // Parse the message to extract date and link
  // Message format: 📅 **Meeting Scheduled!**\n\nI have generated a secure Google Meet link for our session:\n${meetLink}\n\n*Starts: ${start.toLocaleString()}*
  const linkMatch = content.match(/https:\/\/meet\.google\.com\/[a-z0-9-]+/);
  const dateMatch = content.match(/\*Starts: (.*?)\*/);
  const titleMatch = content.match(/\*\*(.*?)\*\*/);
  
  const meetLink = linkMatch ? linkMatch[0] : null;
  const startDate = dateMatch ? dateMatch[1] : null;
  const title = titleMatch ? titleMatch[1] : "Meeting Scheduled";

  if (!meetLink) return <p className="whitespace-pre-wrap">{content}</p>;

  return (
    <div className={`flex flex-col gap-3 p-4 rounded-2xl border w-full max-w-sm shadow-sm transition-all ${
      isOwn 
        ? "bg-bg-elevated border-primary-500/20" 
        : "bg-bg-elevated border-border"
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${isOwn ? "bg-primary-500 text-white" : "bg-primary-50 text-primary-600 dark:bg-primary-900/30"}`}>
          <Video size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-text-primary text-[15px]">{title}</h4>
          <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
            <Clock size={12} className="text-text-muted" />
            {startDate || "In a few minutes"}
          </p>
        </div>
      </div>

      <div className="h-[1px] w-full bg-border/50 my-1" />

      <a 
        href={meetLink} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="w-full"
      >
        <Button 
          variant="primary" 
          className="w-full h-10 flex items-center justify-center gap-2 font-bold text-sm bg-primary-500 hover:bg-primary-600 shadow-md group"
        >
          <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          Join Google Meet
        </Button>
      </a>
      
      <p className="text-[10px] text-text-muted text-center tracking-tight">
        Secure peer-to-peer session
      </p>
    </div>
  );
}
