import { Input } from "@/components/ui/Input"
import { SkillCard } from "@/components/features/skills/SkillCard"
import prisma from "@/lib/prisma"
import { Search } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ""
  const session = await getServerSession(authOptions)
  const currentUserId = session?.user?.id

  // Fetch users with their skills dynamically, applying simple search filter
  const users = await prisma.user.findMany({
    take: 12,
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      avatarUrl: true,
      location: true,
      avgRating: true,
      totalSessions: true,
      skillsOffered: {
        select: {
          level: true,
          skill: {
            select: { name: true, category: true }
          }
        }
      },
      skillsWanted: {
        select: {
          skill: {
            select: { name: true }
          }
        }
      }
    },
    where: {
      id: currentUserId ? { not: currentUserId } : undefined,
      OR: [
        { skillsOffered: { some: {} } },
        { skillsWanted: { some: {} } },
        { bio: { not: "" } },
        { name: { not: "" } }
      ],
      ...(query.trim() ? {
        OR: [
          { name: { contains: query.trim(), mode: "insensitive" } },
          { bio: { contains: query.trim(), mode: "insensitive" } },
          {
            skillsOffered: {
              some: {
                skill: { name: { contains: query.trim(), mode: "insensitive" } }
              }
            }
          },
        ]
      } : {})
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-bg-secondary w-full">
      {/* Sidebar Filters */}
      <aside className="hidden md:flex w-72 shrink-0 flex-col gap-10 p-8 border-r border-border bg-bg-elevated sticky top-0 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-display font-extrabold text-text-primary tracking-tight">Filters</h2>
          <a href="/explore" className="text-[15px] text-primary-600 hover:text-primary-700 font-medium transition-colors">Clear all</a>
        </div>
        
        <details open className="group marker:content-['']">
          <summary className="font-semibold text-lg text-text-primary mb-5 cursor-pointer list-none flex justify-between items-center outline-none select-none">
            Skill Category
            <svg className="w-5 h-5 text-text-muted transition-transform duration-200 group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </summary>
          <div className="flex flex-col gap-4 text-[15px] text-text-secondary pb-4">
            <label className="flex items-center cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded border-border-strong text-primary-500 focus:ring-primary-500 transition-colors" /> 
              <span className="flex items-center gap-2.5 ml-3 group-hover:text-text-primary transition-colors"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0"></span>Technical</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded border-border-strong text-primary-500 focus:ring-primary-500 transition-colors" /> 
              <span className="flex items-center gap-2.5 ml-3 group-hover:text-text-primary transition-colors"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0"></span>Creative</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded border-border-strong text-primary-500 focus:ring-primary-500 transition-colors" /> 
              <span className="flex items-center gap-2.5 ml-3 group-hover:text-text-primary transition-colors"><span className="w-2.5 h-2.5 rounded-full bg-pink-400 shrink-0"></span>Language</span>
            </label>
          </div>
        </details>

        <details open className="group marker:content-['']">
          <summary className="font-semibold text-lg text-text-primary mb-5 cursor-pointer list-none flex justify-between items-center outline-none select-none">
            Skill Level
            <svg className="w-5 h-5 text-text-muted transition-transform duration-200 group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </summary>
          <div className="flex flex-col gap-4 text-[15px] text-text-secondary pb-4">
            <label className="flex items-center cursor-pointer group">
              <input type="radio" name="lvl" className="w-5 h-5 border-border-strong text-primary-500 focus:ring-primary-500 transition-colors" defaultChecked /> 
              <span className="ml-3 group-hover:text-text-primary transition-colors">Any</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input type="radio" name="lvl" className="w-5 h-5 border-border-strong text-primary-500 focus:ring-primary-500 transition-colors" /> 
              <span className="ml-3 group-hover:text-text-primary transition-colors">Beginner</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input type="radio" name="lvl" className="w-5 h-5 border-border-strong text-primary-500 focus:ring-primary-500 transition-colors" /> 
              <span className="ml-3 group-hover:text-text-primary transition-colors">Intermediate</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input type="radio" name="lvl" className="w-5 h-5 border-border-strong text-primary-500 focus:ring-primary-500 transition-colors" /> 
              <span className="ml-3 group-hover:text-text-primary transition-colors">Advanced</span>
            </label>
          </div>
        </details>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 lg:p-12 pl-4 md:pl-12">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <form action="/explore" method="GET" className="relative mb-10 w-full md:max-w-2xl group">
            <Input 
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search for Python, Guitar, French..." 
              className="h-14 md:h-16 text-base md:text-lg pl-14 rounded-2xl bg-bg-elevated shadow-sm border-[1.5px] border-amber-400 hover:border-amber-500 focus:border-amber-500 focus-visible:ring-amber-500 transition-all duration-300 w-full text-text-primary"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500 transition-colors">
              <Search size={22} strokeWidth={2.5} />
            </div>
            <button type="submit" className="hidden">Search</button>
          </form>

          <h2 className="text-3xl font-display font-extrabold mb-8 text-text-primary tracking-tight">Featured Matches</h2>
          
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-bg-elevated rounded-2xl border border-dashed border-border-strong text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">No users found</h3>
              <p className="text-text-muted">We couldn&apos;t find anyone matching these filters right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {users.map((user) => (
                <SkillCard 
                  key={user.id} 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  user={user as any} 
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
