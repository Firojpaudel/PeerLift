"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Calendar, Clock, Video, X } from "lucide-react";
import { format, addHours, startOfHour } from "date-fns";
import { toast } from "sonner";

interface ScheduleMeetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiverId: string;
  onScheduleSuccess: (message: any) => void;
}

export function ScheduleMeetModal({ open, onOpenChange, receiverId, onScheduleSuccess }: ScheduleMeetModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState<string>(format(addHours(startOfHour(new Date()), 1), "HH:mm"));
  const [duration, setDuration] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const scheduledAt = new Date(`${date}T${time}`);
      
      const res = await fetch("/api/meet/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          receiverId, 
          summary: title || undefined, 
          startTime: scheduledAt.toISOString(),
          duration 
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Meeting scheduled and link sent!");
        onScheduleSuccess(data.message);
        onOpenChange(false);
        setTitle("");
      } else {
        toast.error(data.error || "Failed to schedule meeting");
      }
    } catch (error) {
      console.error("Scheduling error:", error);
      toast.error("Failed to connect to scheduling service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-6 w-[440px] max-w-full relative">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary-500/20 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none"></div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-amber-600 flex items-center justify-center text-white shadow-lg">
             <Calendar size={18} />
          </div>
          <div>
             <h3 className="text-xl font-display font-extrabold text-text-primary leading-tight">
               Schedule Session
             </h3>
             <p className="text-[12px] font-medium text-text-muted">Propose a secure Google Meet to your peer</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Meeting Subject</label>
            <input 
              type="text"
              placeholder="e.g. Brainstorming, Code Review..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-border/50 rounded-xl px-4 py-3 text-text-primary text-[13px] focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 outline-none transition-all shadow-sm placeholder:text-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Date</label>
              <div className="relative group">
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white/5 border border-border/50 rounded-xl pl-4 pr-3 py-3 text-text-primary text-[13px] outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-mono"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Start Time</label>
              <div className="relative">
                <input 
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-white/5 border border-border/50 rounded-xl pl-4 pr-3 py-3 text-text-primary text-[13px] outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-mono"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Duration</label>
            <div className="relative">
              <select 
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full bg-white/5 border border-border/50 rounded-xl px-4 py-3 text-text-primary text-[13px] outline-none focus:ring-2 focus:ring-primary-500/30 transition-all appearance-none cursor-pointer"
              >
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour Session</option>
                <option value={90}>1.5 Hours</option>
                <option value={120}>2 Hours (Max)</option>
              </select>
              <Clock size={14} className="absolute right-4 top-[14px] text-text-muted pointer-events-none" />
            </div>
          </div>

          <div className="pt-3">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-[46px] flex items-center justify-center gap-2 group bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Video size={16} className="group-hover:scale-110 transition-transform" />
                  Generate Invitation Link
                </>
              )}
            </Button>
            <p className="text-[10px] text-text-muted mt-3 text-center opacity-70">
              Your peer will receive an auto-expiring secure Google Meet invitation within the chat module.
            </p>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
