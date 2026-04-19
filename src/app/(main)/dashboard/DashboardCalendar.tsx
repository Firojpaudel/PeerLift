"use client";

import { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Video } from 'lucide-react';
import Link from 'next/link';

interface DashboardCalendarProps {
  sessions: any[];
}

export function DashboardCalendar({ sessions }: DashboardCalendarProps) {
  const [date, setDate] = useState<Date>(new Date());

  // Map DB sessions to local format
  const formattedSessions = useMemo(() => {
    return sessions.map(s => ({
      id: s.id,
      date: new Date(s.scheduledAt),
      title: s.role === 'mentor' ? `Teaching ${s.request.requestedSkill.name}` : `Learning ${s.request.offeredSkill.name}`,
      duration: s.duration,
      link: s.meetLink,
      partner: s.role === 'mentor' ? s.learner.name : s.mentor.name
    }));
  }, [sessions]);

  // Find sessions for selected date
  const selectedDaySessions = formattedSessions.filter(session => isSameDay(session.date, date));

  // Function to highlight days with sessions
  const tileContent = ({ date: tileDate, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const hasSessions = formattedSessions.some(session => isSameDay(session.date, tileDate));
      if (hasSessions) {
        return <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mx-auto mt-1 absolute bottom-1 left-1/2 -translate-x-1/2" />;
      }
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="calendar-wrapper bg-bg-elevated rounded-t-2xl p-4">
        <Calendar 
          onChange={(v) => setDate(v as Date)} 
          value={date}
          tileContent={tileContent}
          nextLabel={<ChevronRight size={20} className="text-text-secondary hover:text-primary-500" />}
          prevLabel={<ChevronLeft size={20} className="text-text-secondary hover:text-primary-500" />}
          next2Label={null}
          prev2Label={null}
          tileClassName={({ date: tileDate, view }) => {
             let classes = "text-sm font-medium relative transition-colors ";
             if (view === 'month' && isSameDay(tileDate, date)) {
               classes += "bg-primary-500 text-white hover:bg-primary-600 hover:text-white !font-bold ";
             } else if (view === 'month' && isSameDay(tileDate, new Date())) {
               classes += "text-primary-600 font-bold ";
             }
             return classes;
          }}
          className="w-full border-none font-body bg-transparent react-calendar"
        />
      </div>

      <div className="bg-bg-elevated rounded-b-2xl p-4">
        <h3 className="font-display font-bold text-text-primary mb-4 text-lg flex items-center justify-between">
          <span>{format(date, 'MMMM d, yyyy')}</span>
          <span className="text-sm font-medium bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 px-2.5 py-1 rounded-full">
            {selectedDaySessions.length} {selectedDaySessions.length === 1 ? 'session' : 'sessions'}
          </span>
        </h3>
        
        {selectedDaySessions.length > 0 ? (
          <div className="space-y-4">
            {selectedDaySessions.map(session => (
              <div key={session.id} className="p-4 rounded-xl border border-border-strong bg-bg-secondary flex flex-col gap-3 group hover:border-primary-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-text-primary">{session.title}</h4>
                    <p className="text-xs text-text-secondary">with {session.partner}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/30 px-2 py-0.5 rounded-md">
                    <Clock size={12} />
                    {format(session.date, 'h:mm a')}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-text-secondary">{session.duration} minutes</span>
                  
                  {session.link ? (
                    <a href={session.link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm bg-primary-500 text-white px-3 py-1.5 rounded-lg hover:bg-primary-600 active:scale-95 transition-all font-semibold">
                      <Video size={16} />
                      Join Meet
                    </a>
                  ) : (
                    <span className="text-xs text-text-muted italic bg-bg-elevated border border-border px-2 py-1 rounded-md">Link pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-text-muted flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center mb-3">
              <CalendarIcon size={24} className="text-text-muted opacity-50" />
            </div>
            <p className="text-sm">Your schedule is clear for this day!</p>
            <Link href="/explore">
              <button className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Find a peer to learn from →
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
