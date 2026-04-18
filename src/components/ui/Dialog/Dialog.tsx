import * as React from "react"

// A simple dialog placeholder implementation
export function Dialog({ children, open, onOpenChange }: { children: React.ReactNode, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-bg-elevated rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] border border-border w-full max-w-lg p-6 relative">
        <button onClick={() => onOpenChange(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">✕</button>
        {children}
      </div>
    </div>
  )
}
