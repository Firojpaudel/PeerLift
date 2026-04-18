import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-24 h-24 text-3xl font-display",
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    const classNames = cn(
      "relative flex shrink-0 overflow-hidden rounded-full font-bold items-center justify-center bg-border-strong text-text-primary",
      sizeClasses[size],
      className
    );

    return (
      <div
        ref={ref}
        className={classNames}
        {...props}
      >
        {src || fallback ? (
          <Image fill
            src={src || `https://i.pravatar.cc/150?u=${encodeURIComponent(fallback || alt || 'user')}`}
            alt={alt || "Avatar"}
            className="object-cover" sizes="96px"
          />
        ) : (
          <span>{fallback}</span>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"
