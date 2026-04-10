import { getPromotion } from '@/lib/api/client'

/**
 * PromoBanner — dynamic Server Component.
 *
 * getPromotion() is remote-cached for 1 minute (API protection), but the
 * time validity check (active, validFrom, validUntil) runs here on every
 * render so a promo is never shown past its expiry regardless of cache state.
 * Wrapped in Suspense on the home page so it streams in after the static shell.
 */
export async function PromoBanner() {
  const promo = await getPromotion()
  if (!promo) return null
  if (!promo.active) return null

  const now = new Date()
  if (promo.validFrom && now < new Date(promo.validFrom)) return null
  if (promo.validUntil && now > new Date(promo.validUntil)) return null

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
          {promo.discountPercent && (
            <span className="text-emerald-400 font-semibold">{promo.discountPercent}% off</span>
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
