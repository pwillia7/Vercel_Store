import { formatPrice } from '@/lib/format/currency'
import type { Cart } from '@/lib/api/types'

interface CartSummaryProps {
  cart: Cart
}

export function CartSummary({ cart }: CartSummaryProps) {
  const subtotal = cart.total ?? cart.items.reduce((sum, item) => {
    return sum + (item.price ?? item.product?.price ?? 0) * item.quantity
  }, 0)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="mb-4 text-base font-semibold text-white">Order Summary</h2>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">
            Subtotal ({cart.itemCount ?? cart.items.length}{' '}
            {(cart.itemCount ?? cart.items.length) === 1 ? 'item' : 'items'})
          </span>
          <span className="text-white tabular-nums">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Shipping</span>
          <span className="text-zinc-400">Calculated at checkout</span>
        </div>
      </div>

      <div className="my-4 border-t border-zinc-800" />

      <div className="flex justify-between font-semibold">
        <span className="text-white">Total</span>
        <span className="text-white tabular-nums">{formatPrice(subtotal)}</span>
      </div>

      <button
        type="button"
        className="mt-6 w-full rounded-md bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
      >
        Proceed to Checkout
      </button>

      <p className="mt-3 text-center text-xs text-zinc-600">
        Taxes and shipping calculated at checkout
      </p>
    </div>
  )
}
