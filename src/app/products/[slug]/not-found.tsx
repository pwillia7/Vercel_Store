import Link from 'next/link'

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-32 text-center sm:px-6 lg:px-8">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-600">
        404
      </p>
      <h1 className="mb-4 text-3xl font-bold text-white">Product not found</h1>
      <p className="mb-8 text-zinc-400">
        This product doesn&apos;t exist or may have been removed.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link
          href="/search"
          className="inline-flex h-10 items-center rounded-md bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
        >
          Browse Products
        </Link>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-md border border-zinc-700 px-5 text-sm font-medium text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
