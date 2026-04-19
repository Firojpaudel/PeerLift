import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Video } from "lucide-react";

export default async function SessionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // Fetch real sessions from the database
  const sessions: any[] = await prisma.session.findMany({
    where: {
      OR: [
        { mentorId: userId },
        { learnerId: userId }
      ]
    },
    include: {
      mentor: { select: { id: true, name: true, username: true, avatarUrl: true } },
      learner: { select: { id: true, name: true, username: true, avatarUrl: true } },
      request: {
        include: {
          requestedSkill: { include: { skill: true } },
          offeredSkill: { include: { skill: true } }
        }
      }
    },
    orderBy: { scheduledAt: 'asc' }
  });

  const now = new Date();
  const upcoming = sessions.filter(s => new Date(s.scheduledAt) >= now && s.status === 'SCHEDULED');
  const past = sessions.filter(s => new Date(s.scheduledAt) < now || s.status === 'COMPLETED');

  // Generate current week days
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-8 max-w-6xl mx-auto w-full min-h-screen">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-extrabold mb-2">My Sessions</h1>
          <p className="text-text-secondary">Keep track of your scheduled exchanges.</p>
        </div>
        <Link href="/explore">
          <Button variant="primary">Find a Match</Button>
        </Link>
      </header>

      {/* Dynamic week view */}
      <div className="grid grid-cols-7 gap-4 pt-6 mt-4 border-t border-border mb-8">
        {weekDays.map((day, i) => {
          const isToday = day.toDateString() === today.toDateString();
          const hasSession = sessions.some(s => new Date(s.scheduledAt).toDateString() === day.toDateString());
          return (
            <div key={i} className={`text-center font-mono text-sm border-r border-border last:border-0 pb-2 ${isToday ? 'relative' : ''}`}>
              <div className={`text-text-muted ${isToday ? 'text-primary-600 font-bold' : ''}`}>{dayNames[i]}</div>
              <div className={`font-bold text-lg mt-1 ${isToday ? 'text-primary-600 bg-primary-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto dark:bg-primary-900/30' : 'text-text-primary'}`}>
                {day.getDate()}
              </div>
              {hasSession && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mx-auto mt-1"></div>}
            </div>
          );
        })}
      </div>

      {/* Upcoming Sessions */}
      <div className="space-y-6 mt-10">
        <h2 className="text-xl font-display font-extrabold">Upcoming</h2>
        
        {upcoming.length === 0 ? (
          <div className="text-center py-8 bg-bg-elevated rounded-2xl border border-dashed border-border-strong">
            <Calendar className="mx-auto text-text-muted mb-3" size={32} />
            <p className="text-text-muted">No upcoming sessions.</p>
            <Link href="/explore" className="text-primary-500 hover:underline mt-2 inline-block text-sm">Find a match to schedule one!</Link>
          </div>
        ) : (
          upcoming.map((s) => {
            const isMentor = s.mentorId === userId;
            const otherPerson = isMentor ? s.learner : s.mentor;
            const skillName = s.request?.requestedSkill?.skill?.name || s.request?.offeredSkill?.skill?.name || 'Skill Session';
            const scheduledDate = new Date(s.scheduledAt);
            const isToday = scheduledDate.toDateString() === today.toDateString();
            const isTomorrow = scheduledDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
            const dateLabel = isToday ? 'TODAY' : isTomorrow ? 'TOMORROW' : scheduledDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
            const timeLabel = scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <Card key={s.id} className="p-0 overflow-hidden flex flex-col md:flex-row items-stretch rounded-xl group hover:-translate-y-1 transition-transform">
                <div className="w-2 md:w-4 bg-primary-500 shrink-0"></div>
                <div className="flex-1 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex flex-col">
                    <span className="text-primary-700 font-bold font-mono tracking-wider mb-2 text-sm uppercase dark:text-primary-400">{dateLabel}, {timeLabel}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-semibold">{skillName}</span>
                      <span className="text-text-muted mx-2">with</span>
                      <div className="flex items-center gap-2">
                        <Link href={`/u/${otherPerson?.username}`} className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                          {otherPerson?.avatarUrl ? (
                            <img src={otherPerson.avatarUrl} alt={otherPerson.name} className="w-8 h-8 rounded-full object-cover border border-border" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary-100 font-bold flex items-center justify-center text-xs text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                              {otherPerson?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                            </div>
                          )}
                          <span className="font-medium text-text-secondary">{otherPerson?.name}</span>
                        </Link>
                      </div>
                    </div>
                    <span className="text-xs text-text-muted mt-2 font-medium">
                      {isMentor ? '📤 You are teaching' : '📥 You are learning'} • {s.duration} min
                    </span>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    {s.meetingLink && (
                      <a href={s.meetingLink} target="_blank" rel="noopener noreferrer">
                        <Button variant="primary" className="flex items-center gap-2">
                          <Video size={16} />
                          Join Meet
                        </Button>
                      </a>
                    )}
                    <Link href={`/sessions/chat?peerId=${otherPerson?.id}`}>
                      <Button variant="soft">Chat</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Past Sessions */}
      {past.length > 0 && (
        <div className="space-y-4 mt-12">
          <h2 className="text-xl font-display font-extrabold text-text-secondary">Past Sessions</h2>
          {past.map((s) => {
            const isMentor = s.mentorId === userId;
            const otherPerson = isMentor ? s.learner : s.mentor;
            const skillName = s.request?.requestedSkill?.skill?.name || s.request?.offeredSkill?.skill?.name || 'Session';
            return (
              <Card key={s.id} className="p-0 overflow-hidden flex flex-col md:flex-row items-stretch rounded-xl opacity-70 hover:opacity-100 transition-opacity">
                <div className="w-2 md:w-4 bg-text-muted shrink-0"></div>
                <div className="flex-1 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="text-text-muted font-mono text-xs">{new Date(s.scheduledAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold">{skillName}</span>
                      <span className="text-text-muted text-sm">with {otherPerson?.name}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {s.status}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {sessions.length === 0 && (
        <div className="mt-12 text-center text-text-muted p-12 border-2 border-dashed border-border rounded-xl">
          <span className="text-4xl mb-4 block opacity-50">🗓️</span>
          <p>Your calendar is quite empty.</p>
          <p className="mt-1"><Link href="/explore" className="text-primary-500 hover:underline">Find a match</Link> to start filling it up!</p>
        </div>
      )}
    </div>
  )
}
