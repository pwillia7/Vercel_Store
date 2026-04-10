'use server'

import { revalidatePath } from 'next/cache'
import {
  addToCart as apiAddToCart,
  createCart,
  getProductStock,
  removeCartItem as apiRemoveCartItem,
  updateCartItem as apiUpdateCartItem,
} from '@/lib/api/client'
import { getCartToken, setCartToken } from '@/lib/cart/cookie'
import { normalizeError } from '@/lib/api/errors'
import type { ActionResult, CartItem } from '@/lib/api/types'

/**
 * Get or create a cart token for the current session.
 * On first cart interaction, calls POST /cart/create and persists the token.
 */
async function ensureCartToken(): Promise<string> {
  const existing = await getCartToken()
  if (existing) return existing

  const token = await createCart()
  await setCartToken(token)
  return token
}

/**
 * Revalidate all routes that display cart state.
 * The root layout contains the CartBadge; the cart page shows full contents.
 */
function revalidateCartRoutes() {
  revalidatePath('/', 'layout')
  revalidatePath('/cart')
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Add a product to the cart.
 * Creates a cart session on first use.
 *
 * Pre-flight stock check gives a clear, user-facing error before the request
 * ever hits the cart API. If the stock check itself fails (API down, etc.) we
 * fall through and let the cart API be the final authority.
 *
 * Performance: read the existing token first (cheap cookie lookup), then run
 * the stock check and cart creation in parallel. For returning users the
 * token resolves instantly. For first-time users this saves one serial round
 * trip — createCart() and getProductStock() are independent and can overlap.
 */
export async function addToCart(
  productId: string,
  quantity: number,
): Promise<ActionResult<CartItem>> {
  try {
    const existingToken = await getCartToken()

    const [stock, token] = await Promise.all([
      getProductStock(productId).catch(() => null),
      existingToken
        ? Promise.resolve(existingToken)
        : createCart().then(async (t) => { await setCartToken(t); return t }),
    ])

    if (stock) {
      if (!stock.inStock) {
        return { success: false, error: 'This item is currently out of stock.' }
      }
      if (quantity > stock.stock) {
        return {
          success: false,
          error: `Only ${stock.stock} unit${stock.stock === 1 ? '' : 's'} left in stock. Please reduce your quantity.`,
        }
      }
    }

    const item = await apiAddToCart(token, productId, quantity)
    revalidateCartRoutes()
    return { success: true, data: item }
  } catch (err) {
    return { success: false, error: normalizeError(err) }
  }
}

/**
 * Update the quantity of a cart line item.
 * If quantity reaches 0, remove the item instead.
 */
export async function updateCartItem(
  itemId: string,
  quantity: number,
): Promise<ActionResult<CartItem | void>> {
  try {
    const token = await getCartToken()
    if (!token) return { success: false, error: 'No active cart session.' }

    if (quantity <= 0) {
      await apiRemoveCartItem(token, itemId)
      revalidateCartRoutes()
      return { success: true, data: undefined }
    }

    try {
      const stock = await getProductStock(itemId)
      if (!stock.inStock) return { success: false, error: 'This item is no longer in stock.' }
      if (quantity > stock.stock) {
        return {
          success: false,
          error: `Only ${stock.stock} unit${stock.stock === 1 ? '' : 's'} available.`,
        }
      }
    } catch {
      // Stock fetch failed — let the cart API enforce limits
    }

    const item = await apiUpdateCartItem(token, itemId, quantity)
    revalidateCartRoutes()
    return { success: true, data: item }
  } catch (err) {
    return { success: false, error: normalizeError(err) }
  }
}

/**
 * Remove a cart item entirely.
 */
export async function removeCartItem(itemId: string): Promise<ActionResult<void>> {
  try {
    const token = await getCartToken()
    if (!token) return { success: false, error: 'No active cart session.' }

    await apiRemoveCartItem(token, itemId)
    revalidateCartRoutes()
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: normalizeError(err) }
  }
}
