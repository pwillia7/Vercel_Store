import 'server-only'
import { cacheTag, cacheLife } from 'next/cache'
import { ApiError } from './errors'
import { CACHE_TAGS } from '@/lib/cache/tags'
import type {
  ApiResponse,
  Cart,
  CartItem,
  Category,
  HealthStatus,
  Product,
  Promotion,
  StockInfo,
  StoreConfig,
} from './types'

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!
const BYPASS_TOKEN = process.env.API_BYPASS_TOKEN!

// ─── Core Fetch Helper ────────────────────────────────────────────────────────

interface FetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>
  cartToken?: string
}

/**
 * Low-level API fetch. Always includes the bypass header.
 * Uses cache: 'no-store' because caching is handled at the "use cache" layer,
 * not at the fetch layer — this prevents double-caching conflicts.
 */
async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { cartToken, headers: extraHeaders, ...rest } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-vercel-protection-bypass': BYPASS_TOKEN,
    ...extraHeaders,
    ...(cartToken ? { 'x-cart-token': cartToken } : {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    cache: 'no-store',
  })

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}: ${res.statusText}`
    try {
      const body = await res.json() as ApiResponse<unknown>
      if (body.error) errorMessage = body.error
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, errorMessage)
  }

  const json = await res.json() as ApiResponse<T>

  if (!json.success) {
    throw new ApiError(400, json.error ?? 'API returned a failure response')
  }

  return json.data
}

// ─── Cached Catalog Functions ─────────────────────────────────────────────────
// All catalog functions use "use cache: remote" — shared across all serverless
// instances. All catalog data is cached for 1 hour. Invalidate with revalidateTag().

/**
 * Fetch all products. Remote-cached for 1 hour, shared across all instances.
 * This is the backbone for the homepage grid and search filtering.
 */
export async function getProducts(): Promise<Product[]> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.PRODUCTS)
  cacheLife('hours')

  return apiFetch<Product[]>('/products')
}

/**
 * Fetch a single product by id. Remote-cached for 1 hour, shared across all instances.
 * The product detail page is mostly static; stock is fetched separately.
 */
export async function getProductById(id: string): Promise<Product> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.PRODUCT(id))
  cacheTag(CACHE_TAGS.PRODUCTS) // also shares the broad tag
  cacheLife('hours')

  return apiFetch<Product>(`/products/${encodeURIComponent(id)}`)
}

/**
 * Fetch live price for a product. Remote-cached for 1 minute across all instances.
 * Short TTL (<5 min revalidate) automatically excludes this from the static shell,
 * making it a dynamic hole — wrap callers in a Suspense boundary.
 */
export async function getProductPrice(id: string): Promise<number> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.PRODUCT(id))
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 })

  const product = await apiFetch<Product>(`/products/${encodeURIComponent(id)}`)
  return product.price
}

/**
 * Fetch all categories. Remote-cached for 1 hour, shared across all instances.
 */
export async function getCategories(): Promise<Category[]> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.CATEGORIES)
  cacheLife('hours')

  return apiFetch<Category[]>('/categories')
}

/**
 * Fetch the current active promotion.
 * Not cached — called from a Suspense-wrapped component so it fetches fresh
 * on every page load without blocking the static shell.
 */
/**
 * Fetch the current promotion. Remote-cached for 1 minute across all instances.
 * Returns the raw promo object — time validity is checked in PromoBanner at
 * render time so expiry is always accurate regardless of cache state.
 */
export async function getPromotion(): Promise<Promotion | null> {
  'use cache: remote'
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 })

  try {
    return await apiFetch<Promotion>('/promotions')
  } catch {
    return null
  }
}

/**
 * Fetch store configuration. Remote-cached for 1 day, shared across all instances.
 */
export async function getStoreConfig(): Promise<StoreConfig | null> {
  'use cache: remote'
  cacheLife('days')

  try {
    return await apiFetch<StoreConfig>('/store/config')
  } catch {
    return null
  }
}

// ─── Dynamic / Uncached Functions ─────────────────────────────────────────────
// These are always fetched fresh. Do NOT add "use cache" to these.

/**
 * Fetch real-time stock for a product.
 * Stock changes on every API request — never cache this.
 * Called only on the product detail page inside a Suspense boundary
 * so it doesn't block cached product info from rendering.
 */
export async function getProductStock(productId: string): Promise<StockInfo> {
  return apiFetch<StockInfo>(`/products/${encodeURIComponent(productId)}/stock`)
}

/**
 * Fetch the current cart by session token.
 * Cart data is session-specific and must always be fresh.
 */
export async function getCart(cartToken: string): Promise<Cart> {
  return apiFetch<Cart>('/cart', { cartToken })
}

/**
 * Create a new cart session. Returns the cart token from the response header.
 */
export async function createCart(): Promise<string> {
  // We need the raw Response here to extract the x-cart-token header
  const res = await fetch(`${BASE_URL}/cart/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-vercel-protection-bypass': BYPASS_TOKEN,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new ApiError(res.status, `Failed to create cart: ${res.statusText}`)
  }

  const token = res.headers.get('x-cart-token')
  if (!token) {
    throw new ApiError(500, 'Cart creation succeeded but no cart token was returned')
  }

  return token
}

/**
 * Add a product to the cart. Requires a valid cart token.
 */
export async function addToCart(
  cartToken: string,
  productId: string,
  quantity: number,
): Promise<CartItem> {
  return apiFetch<CartItem>('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
    cartToken,
  })
}

/**
 * Update the quantity of an existing cart item.
 */
export async function updateCartItem(
  cartToken: string,
  itemId: string,
  quantity: number,
): Promise<CartItem> {
  return apiFetch<CartItem>(`/cart/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
    cartToken,
  })
}

/**
 * Remove an item from the cart entirely.
 */
export async function removeCartItem(cartToken: string, itemId: string): Promise<void> {
  await apiFetch<void>(`/cart/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
    cartToken,
  })
}

/**
 * Health check — used only as a diagnostic when critical operations fail.
 * NOT called before catalog or page renders.
 */
export async function getHealth(): Promise<HealthStatus> {
  return apiFetch<HealthStatus>('/health')
}
