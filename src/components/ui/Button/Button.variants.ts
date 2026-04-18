import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-bg-elevated transition-all duration-[var(--transition-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-500 text-neutral-0 hover:bg-primary-600 focus-visible:ring-primary-500 shadow-sm",
        secondary:
          "bg-transparent border border-primary-500 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500",
        ghost:
          "hover:bg-bg-secondary hover:text-text-primary focus-visible:ring-border-strong",
        danger:
          "bg-accent-500 text-neutral-0 hover:bg-accent-terracotta focus-visible:ring-accent-500 shadow-sm",
        soft:
          "bg-primary-50 text-primary-700 hover:bg-primary-100 focus-visible:ring-primary-500",
      },
      size: {
        default: "h-11 px-4 py-2", // 44px min touch target
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-lg px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)
