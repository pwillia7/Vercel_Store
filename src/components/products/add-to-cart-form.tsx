'use client'

import { useState, useTransition } from 'react'
import { addToCart } from '@/app/actions/cart'
import { Button } from '@/components/ui/button'

interface AddToCartFormProps {
  productId: string
  maxQuantity?: number
  initiallyAvailable?: boolean
}

/**
 * AddToCartForm — Client Component.
 *
 * Quantity selector + Add to Cart button.
 * Calls the addToCart Server Action and shows optimistic/error feedback.
 * Respects maxQuantity (from stock) and disabled state when out of stock.
 */
export function AddToCartForm({
  productId,
  maxQuantity = 10,
  initiallyAvailable = true,
}: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  const effectiveMax = Math.max(1, maxQuantity)
  const isDisabled = !initiallyAvailable || maxQuantity === 0

  function handleQuantityChange(delta: number) {
    setQuantity((q) => Math.min(effectiveMax, Math.max(1, q + delta)))
  }

  function handleQuantityInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') { setQuantity(1); return }
    const parsed = parseInt(raw, 10)
    if (!isNaN(parsed)) setQuantity(Math.min(effectiveMax, Math.max(1, parsed)))
  }

  function handleAddToCart() {
    setFeedback(null)
    startTransition(async () => {
      const result = await addToCart(productId, quantity)
      if (result.success) {
        setFeedback({ type: 'success', message: 'Added to cart!' })
        setTimeout(() => setFeedback(null), 3000)
      } else {
        setFeedback({ type: 'error', message: result.error })
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Quantity selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-400">Quantity</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || isDisabled}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <span aria-hidden="true">−</span>
          </button>

          <input
            type="number"
            min={1}
            max={effectiveMax}
            value={quantity}
            onChange={handleQuantityInput}
            disabled={isDisabled}
            aria-label="Quantity"
            className="w-12 rounded border border-zinc-700 bg-transparent px-1 py-1 text-center text-sm font-medium text-white focus:border-zinc-500 focus:outline-none disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />

          <button
            type="button"
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= effectiveMax || isDisabled}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>

      {/* Add to Cart button */}
      <Button
        onClick={handleAddToCart}
        disabled={isDisabled}
        loading={isPending}
        size="lg"
        className="w-full"
      >
        {isDisabled ? 'Out of Stock' : 'Add to Cart'}
      </Button>

      {/* Feedback message */}
      {feedback && (
        <p
          className={`text-sm text-center ${
            feedback.type === 'success' ? 'text-emerald-400' : 'text-red-400'
          }`}
          role="status"
          aria-live="polite"
        >
          {feedback.message}
        </p>
      )}
    </div>
  )
}
