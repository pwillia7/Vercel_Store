import Link from 'next/link'

/**
 * Hero — pure static Server Component. No data fetching.
 * Renders as part of the homepage static shell.
 *
 * Visual element: official Vercel triangle logo.
 * - Mobile: large watermark behind the text (opacity 6%)
 * - Desktop: full-opacity logo in the right column beside the text
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

      {/* Mobile: Vercel logo as centered background watermark */}
      <div className="absolute inset-0 flex items-center justify-center lg:hidden" aria-hidden="true">
        <svg
          viewBox="0 0 116 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-72 opacity-[0.15]"
        >
          <path fillRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z" fill="white" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Left — text content */}
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Official Vercel Merchandise
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Wear the framework you ship with.
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Premium swag for developers who build with Vercel. From tees to tech gear,
              represent the tools you love.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
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

          {/* Right — Vercel logo, desktop only (mobile uses watermark above) */}
          <div className="hidden lg:flex items-center justify-center" aria-hidden="true">
            <svg
              viewBox="0 0 116 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-64"
            >
              <path fillRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z" fill="white" />
            </svg>
          </div>

        </div>
      </div>
    </section>
  )
}
