'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary text-center px-4">
      <div className="text-[100px] mb-4 opacity-50">🚨</div>
      <h2 className="text-2xl font-display font-bold text-text-primary mb-4">Something went wrong!</h2>
      <p className="text-text-secondary max-w-sm mb-8">
        We hit a snag trying to load this page. Don&apos;t worry, our team has been notified.
      </p>
      <Button
        variant="primary"
        className="px-8 py-6 text-lg shadow-sm"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  )
}
