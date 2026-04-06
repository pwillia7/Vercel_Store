import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-600">
        404
      </p>
      <h1 className="mb-4 text-3xl font-bold text-white">Page not found</h1>
      <p className="mb-8 max-w-md text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-md bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
        >
          Go Home
        </Link>
        <Link
          href="/search"
          className="inline-flex h-10 items-center rounded-md border border-zinc-700 px-5 text-sm font-medium text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900"
        >
          Browse Products
        </Link>
      </div>
    </div>
  )
}
