import { getProductStock } from '@/lib/api/client'
import { AddToCartForm } from './add-to-cart-form'

interface ProductActionsProps {
  productId: string
}

type StockVariant = 'out' | 'low' | 'in' | 'unavailable'

const badgeStyles: Record<StockVariant, string> = {
  in:          'border-emerald-800/60 bg-emerald-950/50 text-emerald-400',
  low:         'border-amber-800/60   bg-amber-950/50   text-amber-400',
  out:         'border-red-800/60     bg-red-950/50     text-red-400',
  unavailable: 'border-zinc-800       bg-zinc-900       text-zinc-500',
}

const dotStyles: Record<StockVariant, string> = {
  in:          'bg-emerald-500',
  low:         'bg-amber-500',
  out:         'bg-red-500',
  unavailable: 'bg-zinc-600',
}

/**
 * ProductActions — Server Component, always dynamic.
 *
 * Makes ONE stock fetch and uses the result to drive BOTH:
 *   1. The stock availability indicator
 *   2. The AddToCartForm (disabled state + max quantity)
 *
 * This component is wrapped in a single Suspense boundary in ProductDetail,
 * which means the entire product info section (name, price, image, description)
 * renders immediately from the "use cache" layer while only this interactive
 * section waits for the stock API.
 *
 * Previously, ProductDetail awaited getStockAvailability() directly, which
 * blocked the entire component tree until the stock response arrived.
 */
export async function ProductActions({ productId }: ProductActionsProps) {
  let variant: StockVariant = 'in'
  let label = 'In stock'
  let available = true
  let maxQty = 10

  let stockCount: number | null = null

  try {
    const stock = await getProductStock(productId)

    if (!stock.inStock) {
      variant = 'out'
      label = 'Out of stock'
      available = false
      maxQty = 0
    } else if (stock.lowStock) {
      variant = 'low'
      label = `Only ${stock.stock} left`
      maxQty = stock.stock
      stockCount = stock.stock
    } else {
      label = 'In stock'
      maxQty = stock.stock
      stockCount = stock.stock
    }
  } catch {
    variant = 'unavailable'
    label = 'Stock unavailable'
    available = true
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stock badge */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${badgeStyles[variant]}`}
          aria-label={label}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`} aria-hidden="true" />
          {label}
        </span>

        {/* Exact count shown alongside badge when in-stock quantity is known */}
        {stockCount !== null && variant === 'in' && (
          <span className="text-xs text-zinc-500">{stockCount} available</span>
        )}
      </div>

      {/* Urgency callout — pulsing dot when fewer than 10 remain and not already labelled as low */}
      {available && maxQty > 0 && maxQty < 10 && variant !== 'low' && (
        <div className="flex items-center gap-2.5 rounded-md border border-amber-900/50 bg-amber-950/30 px-3 py-2">
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          <p className="text-xs font-medium text-amber-400">
            Only {maxQty} left — order quickly!
          </p>
        </div>
      )}

      <div className="border-t border-zinc-800" />

      {/* Add to cart form with real stock state */}
      <AddToCartForm
        productId={productId}
        maxQuantity={maxQty}
        initiallyAvailable={available}
      />
    </div>
  )
}

/** Skeleton shown while ProductActions streams in */
export function ProductActionsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Badge skeleton — rounded-full, matches pill shape */}
      <div className="flex items-center gap-3">
        <span className="h-6 w-24 skeleton rounded-full" aria-hidden="true" />
      </div>
      <div className="border-t border-zinc-800" />
      <div className="flex flex-col gap-3">
        <span className="h-4 w-20 skeleton rounded" aria-hidden="true" />
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 skeleton rounded-md" aria-hidden="true" />
          <span className="h-4 w-6 skeleton rounded" aria-hidden="true" />
          <span className="h-9 w-9 skeleton rounded-md" aria-hidden="true" />
        </div>
        <span className="h-12 w-full skeleton rounded-md" aria-hidden="true" />
      </div>
    </div>
  )
}
