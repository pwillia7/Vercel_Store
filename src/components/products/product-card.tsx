import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/format/currency'
import type { Product } from '@/lib/api/types'

interface ProductCardProps {
  product: Product
  /** Pass true for above-the-fold cards — sets eager loading and high fetch priority */
  priority?: boolean
}

/**
 * ProductCard — Server Component.
 * Links to /products/{id}. Uses Next.js <Image> for optimization.
 */
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const href = `/products/${product.slug ?? product.id}`
  const image = product.images?.[0]

  return (
    <Link
      href={href}
      className="group flex flex-col gap-3"
      prefetch={true}
    >
      {/* Image container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-md border border-zinc-800 bg-zinc-900">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
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
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-zinc-300 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-zinc-400">{formatPrice(product.price)}</p>
      </div>
    </Link>
  )
}
