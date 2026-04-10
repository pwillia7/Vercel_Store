import Image from 'next/image'
import { Suspense } from 'react'
import { ProductActions, ProductActionsSkeleton } from './product-actions'
import { ProductPrice, ProductPriceSkeleton } from './product-price'
import { WishlistButton } from './wishlist-button'
import type { Product } from '@/lib/api/types'

interface ProductDetailProps {
  product: Product
  wishlistEnabled?: boolean
  reviewsEnabled?: boolean
}

export function ProductDetail({ product, wishlistEnabled, reviewsEnabled }: ProductDetailProps) {
  const image = product.images?.[0]

  return (
    <div className="flex flex-col gap-16">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Product image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              preload
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-6">
          {product.category && (
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              {product.category}
            </p>
          )}

          <h1 className="text-2xl font-bold text-white sm:text-3xl">{product.name}</h1>

          <Suspense fallback={<ProductPriceSkeleton />}>
            <ProductPrice productId={product.id} />
          </Suspense>

          <Suspense fallback={<ProductActionsSkeleton />}>
            <ProductActions productId={product.id} />
          </Suspense>

          {/* Wishlist — only rendered when feature flag is on */}
          {wishlistEnabled && (
            <div className="border-t border-zinc-800 pt-4">
              <WishlistButton
                product={{
                  id: product.id,
                  slug: product.slug ?? product.id,
                  name: product.name,
                  price: product.price,
                  image: product.images?.[0],
                  category: product.category,
                  description: product.description,
                  tags: product.tags,
                }}
              />
            </div>
          )}

          {product.description && (
            <p className="text-zinc-400 leading-7">{product.description}</p>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="inline-flex items-center rounded-full border border-zinc-800 px-2.5 py-0.5 text-xs text-zinc-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews — only rendered when feature flag is on */}
      {reviewsEnabled && (
        <section aria-labelledby="reviews-heading" className="border-t border-zinc-800 pt-12">
          <h2 id="reviews-heading" className="mb-6 text-lg font-semibold text-white">
            Customer Reviews
          </h2>
          <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 py-16 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 text-zinc-700" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm font-medium text-zinc-400">Reviews coming soon</p>
            <p className="mt-1 text-xs text-zinc-600">Be the first to share your thoughts on this product.</p>
          </div>
        </section>
      )}
    </div>
  )
}
