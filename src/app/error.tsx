'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // In production, send to error monitoring (e.g. Sentry)
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-600">
        Error
      </p>
      <h1 className="mb-4 text-3xl font-bold text-white">Something went wrong</h1>
      <p className="mb-8 max-w-md text-zinc-400">
        An unexpected error occurred. Our team has been notified. Please try again.
      </p>
      <button
        onClick={reset}
        className="inline-flex h-10 items-center rounded-md bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
      >
        Try again
      </button>
    </div>
  )
}
