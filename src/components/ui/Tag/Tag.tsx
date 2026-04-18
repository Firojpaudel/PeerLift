import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
// Ensure you have configured specific colors if extending below, or map closely based on CLAUDE.md specifics

const tagVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
  {
    variants: {
      category: {
        TECHNICAL: "bg-blue-100 text-blue-800",
        CREATIVE: "bg-purple-100 text-purple-800",
        ACADEMIC: "bg-primary-100 text-primary-800",
        SPORTS: "bg-emerald-100 text-emerald-800",
        LANGUAGE: "bg-pink-100 text-pink-800",
        LIFESTYLE: "bg-orange-100 text-orange-800",
        BUSINESS: "bg-slate-100 text-slate-800",
        OTHER: "bg-neutral-100 text-neutral-800",
      },
    },
    defaultVariants: {
      category: "OTHER",
    },
  }
)

export interface TagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagVariants> {
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
}

function Tag({ className, category, level, children, ...props }: TagProps) {
  const getLevelDot = (lvl: string) => {
    switch (lvl) {
      case "BEGINNER":
        return "bg-secondary-500";
      case "INTERMEDIATE":
        return "bg-primary-500";
      case "ADVANCED":
        return "bg-accent-500";
      default:
        return "bg-neutral-400";
    }
  }

  return (
    <div className={cn(tagVariants({ category }), className)} {...props}>
      {level && (
        <span
          className={cn("mr-1.5 h-2 w-2 rounded-full", getLevelDot(level))}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  )
}

export { Tag, tagVariants }
