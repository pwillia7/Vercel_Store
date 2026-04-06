// ─── API Envelope ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: Record<string, unknown>
  error?: string
}

// ─── Catalog ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  /** URL-safe identifier; falls back to id if not provided */
  slug?: string
  name: string
  description: string
  /** Price in cents */
  price: number
  images: string[]
  category: string
  tags: string[]
  featured?: boolean
}

export interface StockInfo {
  productId: string
  /** Current stock quantity — changes on every request */
  stock: number
  /** True when stock > 0 */
  inStock: boolean
  /** True when stock is between 1 and 5 */
  lowStock: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Promotion {
  id: string
  title: string
  description: string
  code?: string
  discount?: string
  discountPercentage?: number
  expiresAt?: string
  active?: boolean
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  /** Unit price in cents at time of add */
  price: number
}

export interface Cart {
  id: string
  items: CartItem[]
  /** Total in cents */
  total: number
  itemCount: number
}

// ─── Health ───────────────────────────────────────────────────────────────────

export type ServiceStatus = 'ok' | 'degraded' | 'down'

export interface HealthStatus {
  status: ServiceStatus
  services?: Record<string, ServiceStatus>
  timestamp?: string
}

// ─── Store Config ─────────────────────────────────────────────────────────────

export interface StoreConfig {
  storeName: string
  currency: string
  features: {
    liveChat: boolean
    productComparison: boolean
    recentlyViewed: boolean
    reviews: boolean
    wishlist: boolean
  }
  seo: {
    defaultTitle: string
    defaultDescription: string
    titleTemplate: string
  }
  socialLinks: {
    twitter?: string
    github?: string
    discord?: string
  }
}

// ─── Action Results ───────────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
