import { getPromotion } from '@/lib/api/client'

/**
 * PromoBanner — dynamic Server Component (no cache).
 *
 * Intentionally uncached so the promotion is fetched fresh on every page
 * load. Wrapped in Suspense on the home page so it streams in after the
 * static shell without blocking anything above it.
 */
export async function PromoBanner() {
  const promo = await getPromotion()
  if (!promo) return null

  return (
    <div className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-sm">
          <span className="font-medium text-white">{promo.title}</span>
          {promo.description && (
            <span className="text-zinc-400">{promo.description}</span>
          )}
          {promo.code && (
            <span className="inline-flex items-center rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-mono text-xs text-zinc-300">
              {promo.code}
            </span>
          )}
          {promo.discount && (
            <span className="text-emerald-400 font-semibold">{promo.discount}</span>
          )}
        </div>
      </div>
    </div>
  )
}

/** Minimal fallback while PromoBanner streams in */
export function PromoBannerFallback() {
  return (
    <div className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="h-5 skeleton rounded mx-auto w-64" aria-hidden="true" />
      </div>
    </div>
  )
}
