import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductById, getProducts, getStoreConfig } from '@/lib/api/client'
import { ApiError } from '@/lib/api/errors'
import { ProductDetail } from '@/components/products/product-detail'
import { RecentlyViewedTracker } from '@/components/home/recently-viewed-client'
import { formatPrice } from '@/lib/format/currency'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const products = await getProducts()
    return products.map((p) => ({ slug: p.slug ?? p.id }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const product = await getProductById(slug)
    const image = product.images?.[0]

    return {
      title: product.name,
      description: product.description
        ? product.description.slice(0, 160)
        : `${product.name} — ${formatPrice(product.price)}`,
      openGraph: {
        title: product.name,
        description: product.description?.slice(0, 160) ?? product.name,
        images: image ? [{ url: image, alt: product.name }] : undefined,
        type: 'website',
      },
    }
  } catch {
    return { title: 'Product', description: 'View product details' }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  const [product, config] = await Promise.all([
    getProductById(slug).catch((err: unknown) => {
      if (err instanceof ApiError && err.isNotFound) notFound()
      throw err
    }),
    getStoreConfig(),
  ])

  const trackerItem = {
    id: product.id,
    slug: product.slug ?? product.id,
    name: product.name,
    price: product.price,
    image: product.images?.[0],
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Track this view in localStorage (client-side, no render output) */}
      {config?.features?.recentlyViewed && <RecentlyViewedTracker product={trackerItem} />}

      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/search" className="hover:text-zinc-300 transition-colors">Products</Link>
        <span aria-hidden="true">/</span>
        <span className="text-zinc-400">{product.name}</span>
      </nav>

      <ProductDetail
        product={product}
        wishlistEnabled={config?.features?.wishlist}
        reviewsEnabled={config?.features?.reviews}
      />
    </div>
  )
}
