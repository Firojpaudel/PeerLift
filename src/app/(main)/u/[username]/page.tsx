import { SkillCategory } from "@prisma/client"
import Image from "next/image";
import prisma from "@/lib/prisma"
import { Tag } from "@/components/ui/Tag"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProfileActions } from "@/components/features/profile/ProfileActions";

// We omit full functional component for brevity but scaffold the necessary parts
export default async function ProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const session = await getServerSession(authOptions);
  
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      skillsOffered: { include: { skill: true } },
      skillsWanted: { include: { skill: true } },
      reviewsReceived: true,
    },
  })

  const currentUser = session?.user?.id ? await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      skillsOffered: { include: { skill: true } },
      skillsWanted: { include: { skill: true } },
    }
  }) : null;

  // Simulated fetch
  if (!user) {
    // notFound()
    return <div className="p-24 text-center font-bold text-xl">User not found.</div>
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-bg-secondary w-full overflow-y-auto">
      {/* Profile Hero */}
      <div className="relative w-full h-56 bg-gradient-to-r from-[#f5af19] to-[#f12711] shrink-0">
        <div className="absolute -bottom-16 left-8 md:left-24 z-10 w-fit">
          <div className="relative h-32 w-32 rounded-full border-[6px] border-white bg-neutral-200 overflow-hidden ring-1 ring-border shadow-xl">
            {/* Avatar placeholder */}
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.name || "User"} fill className="object-cover" sizes="128px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-display font-extrabold text-text-muted bg-neutral-50 shadow-inner">
                {(user.name || "User").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 md:px-24 w-full flex-1 pt-20 pb-20">
        <div className="flex flex-col md:flex-row md:justify-between items-start gap-6">
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <h1 className="text-[32px] font-display font-extrabold text-text-primary tracking-tight leading-tight">{user.name || "User"}</h1>
              <p className="text-text-muted font-medium">@{user.username}</p>
            </div>
            
            <p className="text-[15px] text-text-secondary max-w-2xl">{user.bio || "No bio provided yet."}</p>
            
            <div className="font-mono text-xs text-text-muted/80 pt-2 tracking-wide font-bold">
              {user.skillsOffered.length} Skills Taught <span className="opacity-50 px-1">•</span> {user.totalSessions} Sessions <span className="opacity-50 px-1">•</span> {user.avgRating} <span className="text-amber-400">⭐</span>
            </div>
          </div>
          
          <ProfileActions 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            user={user as any} 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            currentUser={currentUser as any} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14">
          {/* Skills Offered */}
          <div className="bg-bg-elevated border border-border shadow-[var(--shadow-sm)] rounded-[20px] p-6 hover:shadow-[var(--shadow-md)] transition-shadow">
            <h3 className="text-lg font-bold text-text-primary mb-5 relative inline-block">
              Skills I Teach
              <span className="hidden w-8 h-1 bg-green-500 absolute -bottom-2 left-0 rounded-full"></span>
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {user.skillsOffered.length === 0 && <p className="text-text-muted text-sm italic">Not offering any skills yet.</p>}
              {user.skillsOffered.map((us) => (
                <Tag key={us.id} category={us.skill.category as SkillCategory} level={us.level}>
                   {us.skill.name}
                </Tag>
              ))}
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="bg-bg-elevated border border-dashed border-border-strong rounded-[20px] p-6 hover:border-primary-300 transition-colors">
            <h3 className="text-lg font-bold text-text-secondary mb-5">Skills I Want to Learn</h3>
            <div className="flex flex-wrap gap-2.5">
              {user.skillsWanted.length === 0 && <p className="text-text-muted text-sm italic">Not seeking any skills yet.</p>}
              {user.skillsWanted.map((us) => (
                <Tag key={us.id} category={us.skill.category as SkillCategory}>
                   {us.skill.name}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
