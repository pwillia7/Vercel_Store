'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { updateCartItem } from '@/app/actions/cart'

const DEBOUNCE_MS = 600

interface QuantityAdjusterProps {
  itemId: string
  quantity: number
  maxQuantity?: number
}

/**
 * QuantityAdjuster — Client Component.
 *
 * Debounces cart update requests so rapid +/- clicks batch into one request.
 * Shows a local optimistic value immediately; syncs back to server state on
 * revalidation or reverts on error.
 */
export function QuantityAdjuster({ itemId, quantity, maxQuantity = 99 }: QuantityAdjusterProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [localQty, setLocalQty] = useState(quantity)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track the last confirmed server value so we can revert on error
  const committedQty = useRef(quantity)

  // Keep local value in sync when the server-revalidated prop changes
  useEffect(() => {
    committedQty.current = quantity
    setLocalQty(quantity)
  }, [quantity])

  function scheduleUpdate(newQty: number) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setError(null)
      startTransition(async () => {
        const result = await updateCartItem(itemId, newQty)
        if (!result.success) {
          setError(result.error ?? 'Failed to update quantity.')
          setLocalQty(committedQty.current)
        }
      })
    }, DEBOUNCE_MS)
  }

  function handleStep(delta: number) {
    const next = Math.min(maxQuantity, Math.max(1, localQty + delta))
    setLocalQty(next)
    scheduleUpdate(next)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      setLocalQty(0)
      return
    }
    const parsed = parseInt(raw, 10)
    if (isNaN(parsed) || parsed < 0) return
    const clamped = Math.min(maxQuantity, parsed)
    setLocalQty(clamped)
    if (clamped >= 1) scheduleUpdate(clamped)
  }

  function handleBlur() {
    // If the field was cleared or set to 0, revert to last good value
    if (!localQty || localQty < 1) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setLocalQty(committedQty.current)
    }
  }

  return (
    <div>
      <div className={`flex items-center gap-1 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
        <button
          type="button"
          onClick={() => handleStep(-1)}
          disabled={isPending || localQty <= 1}
          className="flex h-7 w-7 items-center justify-center rounded border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Decrease quantity"
        >
          <span aria-hidden="true">−</span>
        </button>

        <input
          type="number"
          min={1}
          max={maxQuantity}
          value={localQty || ''}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={isPending}
          aria-label="Quantity"
          className="w-12 rounded border border-zinc-700 bg-transparent px-1 py-0.5 text-center text-sm tabular-nums text-white focus:border-zinc-500 focus:outline-none disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={() => handleStep(1)}
          disabled={isPending || localQty >= maxQuantity}
          className="flex h-7 w-7 items-center justify-center rounded border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-400" role="alert">{error}</p>
      )}
    </div>
  )
}
