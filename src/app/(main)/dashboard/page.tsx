import { BarChart, Zap, PlusCircle, CheckCircle, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { LearningAnalytics } from './LearningAnalytics';
import { DashboardCalendar } from './DashboardCalendar';
import { OnboardingPortal } from './OnboardingPortal';
import { DashboardTour } from '@/components/features/tutorial/DashboardTour';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Fetch user related data in parallel to eliminate slow sequential queries and joins
  const [
    userObj,
    dbSkillsOffered,
    dbSkillsWanted,
    dbRequestsReceived,
    dbSessionsAsMentor,
    dbSessionsAsLearner,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, username: true, credits: true },
    }),
    prisma.userSkill.findMany({
      where: { offeringUserId: session.user.id },
      include: { skill: true },
    }),
    prisma.userSkill.findMany({
      where: { wantingUserId: session.user.id },
      include: { skill: true },
    }),
    prisma.exchangeRequest.findMany({
      where: { receiverId: session.user.id, status: 'PENDING' },
      include: {
        sender: true,
        requestedSkill: { include: { skill: true } },
        offeredSkill: { include: { skill: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.session.findMany({
      where: { mentorId: session.user.id },
      include: {
        learner: true,
        request: {
          include: {
            requestedSkill: { include: { skill: true } },
            offeredSkill: { include: { skill: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    }),
    prisma.session.findMany({
      where: { learnerId: session.user.id },
      include: {
        mentor: true,
        request: {
          include: {
            requestedSkill: { include: { skill: true } },
            offeredSkill: { include: { skill: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    }),
  ]);

  if (!userObj) return null;

  // Reconstruct user object to maintain compatibility with downstream code
  const user = {
    ...userObj,
    skillsOffered: dbSkillsOffered,
    skillsWanted: dbSkillsWanted,
    requestsReceived: dbRequestsReceived,
    sessionsAsMentor: dbSessionsAsMentor,
    sessionsAsLearner: dbSessionsAsLearner,
  };

  const firstName = user.name?.split(' ')[0] || user.username || 'Learner';

  const skillsOffered = user.skillsOffered || [];
  const skillsWanted = user.skillsWanted || [];
  const sessionsAsMentor = user.sessionsAsMentor || [];
  const sessionsAsLearner = user.sessionsAsLearner || [];
  const requestsReceived = user.requestsReceived || [];

  // A user is "new" if they have no skills and no sessions
  const isNewUser =
    skillsOffered.length === 0 &&
    skillsWanted.length === 0 &&
    sessionsAsMentor.length === 0 &&
    sessionsAsLearner.length === 0;

  // Combine and sort sessions for history
  const allSessions = [
    ...sessionsAsMentor.map((s) => ({ ...s, role: 'mentor' as const })),
    ...sessionsAsLearner.map((s) => ({ ...s, role: 'learner' as const })),
  ].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const recentHistory = allSessions.slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen w-full relative">
      <header
        id="welcome-hero"
        className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-display font-extrabold text-text-primary tracking-tight">
            Good morning, {firstName}.
          </h1>
          <p className="text-lg text-text-secondary mt-2 font-medium">
            Here&apos;s what&apos;s happening with your learning journey today.
          </p>
        </div>
        <div
          id="credit-balance-widget"
          className="bg-gradient-to-r from-primary-500 to-amber-600 p-4 rounded-2xl text-white shadow-xl flex items-center gap-4 shrink-0"
        >
          <div className="bg-white/20 p-3 rounded-full">
            <Zap className="text-amber-100" size={24} />
          </div>
          <div>
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Your Balance</p>
            <div className="text-2xl font-display font-extrabold flex items-baseline gap-1 text-white">
              <span>{user.credits}</span>
              <span className="text-sm font-medium text-white/80">Credits</span>
            </div>
          </div>
          <Link href="/explore">
            <button className="ml-auto bg-white text-amber-600 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform hover:shadow-xl focus:ring-4 ring-white/30">
              Earn More
            </button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {isNewUser ? (
            <OnboardingPortal />
          ) : (
            <>
              {/* Quick Actions Bar */}
              <section id="quick-actions-section" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/settings?tab=profile"
                  className="bg-bg-elevated p-6 rounded-2xl border border-border hover:border-primary-400 hover:shadow-[var(--shadow-md)] transition-all flex flex-col items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-500 text-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlusCircle size={24} />
                  </div>
                  <h3 className="font-semibold text-text-primary">Post a Skill</h3>
                </Link>
                <Link
                  href="/explore"
                  className="bg-bg-elevated p-6 rounded-2xl border border-border hover:border-primary-400 hover:shadow-[var(--shadow-md)] transition-all flex flex-col items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary-500 text-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart size={24} />
                  </div>
                  <h3 className="font-semibold text-text-primary">Browse Matches</h3>
                </Link>
                <Link
                  href="/requests"
                  className="bg-bg-elevated p-6 rounded-2xl border border-border hover:border-primary-400 hover:shadow-[var(--shadow-md)] transition-all flex flex-col items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-full bg-accent-500 text-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar size={24} />
                  </div>
                  <h3 className="font-semibold text-text-primary">View Requests</h3>
                </Link>
              </section>

              {/* Analytics Graph area */}
              <LearningAnalytics sessions={allSessions} />

              {/* Pending Requests Widget */}
              {requestsReceived.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-xl font-display font-extrabold mb-5 flex items-center gap-2">
                    <Clock size={20} className="text-primary-500" />
                    Pending Requests
                  </h2>
                  <div className="space-y-3">
                    {requestsReceived.map((req) => (
                      <div
                        key={req.id}
                        className="bg-bg-elevated rounded-2xl border border-border p-5 shadow-[var(--shadow-sm)] flex items-center justify-between hover:border-primary-300 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Link
                            href={`/u/${req.sender?.username}`}
                            className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0 border-2 border-bg-elevated relative hover:scale-105 transition-transform dark:bg-primary-900/30 group overflow-hidden"
                          >
                            {req.sender?.avatarUrl ? (
                              <img
                                src={req.sender.avatarUrl}
                                alt={req.sender.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-primary-700 font-bold dark:text-primary-400 group-hover:scale-110 transition-transform">
                                {req.sender?.name?.charAt(0) || '?'}
                              </span>
                            )}
                          </Link>
                          <div>
                            <Link href={`/u/${req.sender?.username}`} className="group">
                              <h4 className="font-bold text-text-primary text-[15px] flex items-center gap-1.5 group-hover:text-primary-600 transition-colors">
                                {req.sender?.name || 'Unknown'}{' '}
                                <span className="inline-block font-mono text-[10px] font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full dark:bg-primary-900/30 dark:text-primary-400">
                                  PENDING
                                </span>
                              </h4>
                            </Link>
                            <p className="text-sm text-text-secondary mt-1">
                              Wants to learn {req.requestedSkill?.skill?.name || 'a skill'} from you
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-4 py-2 border border-border-strong text-text-primary text-sm font-semibold rounded-xl hover:bg-bg-secondary transition active:scale-95">
                            Reject
                          </button>
                          <button className="px-4 py-2 bg-primary-500 text-white shadow-sm text-sm font-semibold rounded-xl hover:bg-primary-600 transition active:scale-95">
                            Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* History */}
              {recentHistory.length > 0 && (
                <section>
                  <h2 className="text-xl font-display font-extrabold mb-5 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-500" />
                    Recent History
                  </h2>
                  <div className="space-y-3">
                    {recentHistory.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-4 p-4 bg-bg-elevated rounded-xl border border-border shadow-sm hover:border-primary-300 transition-colors"
                      >
                        <div
                          className={`w-10 h-10 rounded-full ${s.role === 'mentor' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'} dark:bg-opacity-20 flex items-center justify-center shrink-0`}
                        >
                          <span className="font-bold text-lg">
                            {s.role === 'mentor' ? '+' : '-'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-text-primary text-[15px]">
                            {s.role === 'mentor'
                              ? `Taught ${s.request?.requestedSkill?.skill?.name || 'a skill'}`
                              : `Learned ${s.request?.offeredSkill?.skill?.name || 'a skill'}`}
                            {' with '}
                            {s.role === 'mentor'
                              ? s.learner?.name || 'a peer'
                              : s.mentor?.name || 'a peer'}
                          </h4>
                          <p className="text-sm text-text-secondary">
                            Completed {s.duration} min session
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-bold ${s.role === 'mentor' ? 'text-green-600' : 'text-amber-600'}`}
                          >
                            {s.role === 'mentor' ? '+30' : '-30'} Credits
                          </span>
                          <p className="text-xs text-text-muted tracking-tight">
                            {new Date(s.scheduledAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div
            id="lifetime-impact-section"
            className="bg-bg-elevated p-6 rounded-2xl border border-border shadow-[var(--shadow-sm)]"
          >
            <h3 className="font-display font-bold text-text-primary mb-4 text-xl">
              Lifetime Impact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-500">
                  <span className="font-bold">{sessionsAsMentor.length}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-text-primary">Skills Taught</div>
                  <div className="w-full bg-bg-secondary h-2 rounded-full mt-1">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${Math.min(sessionsAsMentor.length * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center text-secondary-500">
                  <span className="font-bold">{sessionsAsLearner.length}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-text-primary">Skills Learned</div>
                  <div className="w-full bg-bg-secondary h-2 rounded-full mt-1">
                    <div
                      className="bg-secondary-500 h-2 rounded-full"
                      style={{ width: `${Math.min(sessionsAsLearner.length * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section id="schedule-calendar-section">
            <h3 className="font-display font-bold text-text-primary mb-4 text-xl flex items-center gap-2">
              <Calendar className="text-secondary-500" size={20} />
              Your Schedule
            </h3>
            <div className="bg-bg-elevated rounded-2xl border border-border shadow-[var(--shadow-sm)]">
              <DashboardCalendar sessions={allSessions} />
            </div>
          </section>

          {/* Dynamic Sidebar element: My Skills */}
          <section className="bg-bg-elevated p-6 rounded-2xl border border-border shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-text-primary text-xl">My Skills</h3>
            </div>

            <div className="space-y-4">
              {skillsOffered.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Teaching
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skillsOffered.map((us) => (
                      <span
                        key={us.id}
                        className="bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1 text-sm rounded-full font-mono font-medium"
                      >
                        {us.skill?.name || 'Unknown Skill'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {skillsWanted.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Learning
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skillsWanted.map((us) => (
                      <span
                        key={us.id}
                        className="bg-bg-secondary text-text-secondary border border-border-strong px-3 py-1 text-sm rounded-full font-mono border-dashed"
                      >
                        {us.skill?.name || 'Unknown Skill'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {skillsOffered.length === 0 && skillsWanted.length === 0 && (
                <p className="text-sm text-text-muted italic">No skills added yet.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
      <DashboardTour />
    </div>
  );
}
