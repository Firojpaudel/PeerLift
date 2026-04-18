"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-full border border-border-strong flex items-center justify-center bg-bg-secondary text-text-secondary opacity-50" disabled>
        <div className="w-4 h-4" />
      </button>
    )
  }

  const isDark = theme === "dark" || (theme === "system" && systemTheme === "dark")

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 rounded-full border border-border flex items-center justify-center bg-bg-elevated hover:bg-bg-secondary hover:border-primary-500 hover:text-primary-600 active:scale-95 transition-all text-text-secondary shadow-sm shadow-[var(--shadow-xs)]"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
