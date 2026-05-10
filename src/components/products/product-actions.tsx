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
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${badgeStyles[variant]}`}
          aria-label={label}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`} aria-hidden="true" />
          {label}
        </span>

        {stockCount !== null && variant === 'in' && (
          <span className="text-xs text-zinc-500">{stockCount} available</span>
        )}
      </div>

      <div className="border-t border-zinc-800" />

      <AddToCartForm
        productId={productId}
        maxQuantity={maxQty}
        initiallyAvailable={available}
      />
    </div>
  )
}

/**
 * Skeleton shown while ProductActions streams in.
 *
 * Height breakdown (px):
 *   badge (26) + gap-4 (16) + divider (1) + gap-4 (16) +
 *   label (20) + gap-2 (8) + buttons (36) + gap-4 (16) + CTA (48) = 187
 *
 * Badge is 26px: border(1) + py-1(4) + text-xs line-height(16) + py-1(4) + border(1)
 */
export function ProductActionsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Badge pill: border(1) + py-1(4) + text-xs(16) + py-1(4) + border(1) = 26px */}
      <div className="flex items-center gap-3">
        <span className="h-[26px] w-24 skeleton rounded-full" aria-hidden="true" />
      </div>

      <div className="border-t border-zinc-800" />

      {/* AddToCartForm: gap-4 outer, gap-2 for label+buttons */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {/* "Quantity" label: text-sm line-height = 20px = h-5 */}
          <span className="h-5 w-20 skeleton rounded" aria-hidden="true" />
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 skeleton rounded-md" aria-hidden="true" />
            <span className="h-9 w-12 skeleton rounded" aria-hidden="true" />
            <span className="h-9 w-9 skeleton rounded-md" aria-hidden="true" />
          </div>
        </div>
        {/* CTA: size="lg" = h-12 */}
        <span className="h-12 w-full skeleton rounded-md" aria-hidden="true" />
      </div>
    </div>
  )
}
