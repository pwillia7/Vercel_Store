/**
 * Cache tag taxonomy for the Vercel Swag Store.
 *
 * Tags are used with `cacheTag()` inside "use cache" functions and
 * with `revalidateTag()` in Server Actions to selectively invalidate
 * cached data.
 *
 * Tag policy:
 * - PRODUCTS / PRODUCT / CATEGORIES: long-lived (1 hr), stable catalog data
 * - PROMOTIONS: short-lived (60 s), semi-random API responses
 * - STOCK / CART: never cached — always fetched fresh
 */
export const CACHE_TAGS = {
  /** All products list */
  PRODUCTS: 'products',

  /** Single product by id */
  PRODUCT: (id: string) => `product:${id}`,

  /** Categories list */
  CATEGORIES: 'categories',

  /** Current promotion (short TTL) */
  PROMOTIONS: 'promotions',

  /**
   * Stock is NOT cached — included here only for documentation
   * and for Server Actions that may need to communicate "stock changed".
   * Do NOT use this tag with cacheTag(); stock data is always fresh.
   */
  STOCK: (id: string) => `stock:${id}`,
} as const
