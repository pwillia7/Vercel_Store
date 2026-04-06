import { getProductStock } from '@/lib/api/client'

interface StockStatusProps {
  productId: string
}

type StockDisplay =
  | { variant: 'out'; label: string }
  | { variant: 'low'; label: string }
  | { variant: 'in'; label: string }
  | { variant: 'unavailable'; label: string }

export async function StockStatus({ productId }: StockStatusProps) {
  let display: StockDisplay

  try {
    const stock = await getProductStock(productId)

    if (!stock.inStock) {
      display = { variant: 'out', label: 'Out of stock' }
    } else if (stock.lowStock) {
      // API tells us directly when stock is low (1–5 units)
      display = { variant: 'low', label: `Only ${stock.stock} left in stock` }
    } else {
      display = { variant: 'in', label: 'In stock' }
    }
  } catch {
    display = { variant: 'unavailable', label: 'Stock unavailable' }
  }

  const colorMap = {
    out: { dot: 'bg-red-500', text: 'text-red-400' },
    low: { dot: 'bg-yellow-500', text: 'text-yellow-400' },
    in: { dot: 'bg-emerald-500', text: 'text-emerald-400' },
    unavailable: { dot: 'bg-zinc-600', text: 'text-zinc-500' },
  }

  const colors = colorMap[display.variant]

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${colors.dot}`} aria-hidden="true" />
      <span className={`text-sm ${colors.text}`}>{display.label}</span>
    </div>
  )
}
