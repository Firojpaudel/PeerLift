import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { CheckCircle2, UserRound, Sparkles, StarHalf } from "lucide-react";

interface Skill {
    id: string;
    name: string;
    category: "TECHNICAL" | "CREATIVE" | "ACADEMIC" | "LANGUAGE" | "SPORTS" | "LIFESTYLE" | "BUSINESS" | "OTHER";
}

interface UserSkill {
    id: string;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    skill: Skill;
}

interface SkillCardProps {
    user: {
        id: string;
        username: string;
        name: string;
        avatarUrl?: string | null;
        skillsOffered: UserSkill[];
        skillsWanted: UserSkill[];
        _matchType?: "PERFECT" | "PARTIAL" | null;
    };
    currentUserIdsMatch?: boolean; // if we want to show match badges
}

export function SkillCard({ user }: SkillCardProps) {
    return (
        <Card className="flex flex-col h-full bg-bg-elevated border border-border shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 rounded-[var(--radius-xl)] overflow-hidden">
            <div className="p-5 flex items-start gap-4 border-b border-border relative">
                <Avatar src={user.avatarUrl || undefined} alt={user.name} fallback={user.name.slice(0, 2).toUpperCase()} size="lg" />
                <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-display font-bold text-lg text-text-primary leading-tight truncate">{user.name}</h3>
                    <p className="text-sm text-text-muted truncate">@{user.username}</p>
                </div>

                {/* Match Badge matching design system */}
                {user._matchType === "PERFECT" && (
                    <div className="absolute top-4 right-4 bg-secondary-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <Sparkles size={10} /> Perfect Match
                    </div>
                )}
                {user._matchType === "PARTIAL" && (
                    <div className="absolute top-4 right-4 bg-primary-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <StarHalf size={10} /> Partial Match
                    </div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col gap-5">
                {/* Teaches */}
                <div>
                    <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-secondary-500" /> I Teach
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {user.skillsOffered.length > 0 ? (
                            user.skillsOffered.map((usLine) => (
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                <Tag key={usLine.id} category={(usLine.skill?.category || "OTHER") as any} level={usLine.level}>
                                    {usLine.skill?.name || "Unknown Skill"}
                                </Tag>
                            ))
                        ) : (
                            <span className="text-sm text-text-muted italic">Nothing listed yet</span>
                        )}
                    </div>
                </div>

                {/* Wants to learn */}
                <div className="mt-auto pt-2">
                    <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <UserRound size={12} className="text-primary-500" /> I want to learn
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {user.skillsWanted.length > 0 ? (
                            user.skillsWanted.map((usLine) => (
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                <Tag key={usLine.id} category={(usLine.skill?.category || "OTHER") as any} className="opacity-80 border-dashed border">
                                    {usLine.skill?.name || "Unknown Skill"}
                                </Tag>
                            ))
                        ) : (
                            <span className="text-sm text-text-muted italic">Nothing listed yet</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-bg-secondary border-t border-border mt-auto">
                {user.username ? (
                    <Link href={`/u/${user.username}`} passHref className="w-full block">
                        <Button variant="soft" className="w-full">
                            View Profile
                        </Button>
                    </Link>
                ) : (
                    <Button variant="soft" className="w-full" disabled>
                        Profile Incomplete
                    </Button>
                )}
            </div>
        </Card>
    );
}