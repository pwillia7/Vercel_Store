import Link from 'next/link'

/**
 * Hero — pure static Server Component. No data fetching.
 * Renders as part of the homepage static shell.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-800">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl text-center">
          {/* Label */}
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Official Vercel Merchandise
          </p>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Wear the framework you ship with.
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg leading-8 text-zinc-400">
            Premium swag for developers who build with Vercel. From tees to tech gear,
            represent the tools you love.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/categories/all"
              className="inline-flex h-11 items-center justify-center rounded-md bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Browse All Products
            </Link>
            <Link
              href="/categories"
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-700 px-6 text-sm font-medium text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
