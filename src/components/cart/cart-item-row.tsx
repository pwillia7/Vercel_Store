'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { removeCartItem } from '@/app/actions/cart'
import { QuantityAdjuster } from './quantity-adjuster'
import { formatPrice } from '@/lib/format/currency'
import type { CartItem } from '@/lib/api/types'

interface CartItemRowProps {
  item: CartItem
}

/**
 * CartItemRow — Client Component.
 * Displays a cart line item with quantity controls and remove button.
 */
export function CartItemRow({ item }: CartItemRowProps) {
  const [isRemoving, startTransition] = useTransition()
  const [removeError, setRemoveError] = useState<string | null>(null)
  const image = item.product?.images?.[0]
  const lineTotal = (item.price ?? item.product?.price ?? 0) * item.quantity

  function handleRemove() {
    setRemoveError(null)
    startTransition(async () => {
      const result = await removeCartItem(item.productId)
      if (!result.success) setRemoveError(result.error ?? 'Failed to remove item.')
    })
  }

  return (
    <div
      className={`flex gap-4 py-4 transition-opacity ${isRemoving ? 'opacity-40' : ''}`}
      aria-label={`Cart item: ${item.product?.name}`}
    >
      {/* Product image */}
      <Link
        href={`/products/${item.product?.slug ?? item.productId}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900"
      >
        {image ? (
          <Image
            src={image}
            alt={item.product?.name ?? 'Product'}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}
      </Link>

      {/* Item details */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${item.product?.slug ?? item.productId}`}
            className="text-sm font-medium text-white hover:text-zinc-300 transition-colors line-clamp-2"
          >
            {item.product?.name ?? 'Unknown product'}
          </Link>
          <span className="shrink-0 text-sm font-medium text-white tabular-nums">
            {formatPrice(lineTotal)}
          </span>
        </div>

        <p className="text-xs text-zinc-500">{formatPrice(item.price ?? item.product?.price ?? 0)} each</p>

        {/* Controls */}
        <div className="mt-2 flex items-center justify-between">
          <QuantityAdjuster itemId={item.productId} quantity={item.quantity} />

          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-xs text-zinc-600 transition-colors hover:text-red-400 disabled:cursor-not-allowed"
            aria-label={`Remove ${item.product?.name} from cart`}
          >
            Remove
          </button>
        </div>

        {removeError && (
          <p className="mt-1 text-xs text-red-400" role="alert">{removeError}</p>
        )}
      </div>
    </div>
  )
}
