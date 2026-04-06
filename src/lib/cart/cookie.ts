import 'server-only'
import { cookies } from 'next/headers'

export const CART_COOKIE_NAME = 'cart_token'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24, // 24 hours, matching API cart expiry
  path: '/',
}

/**
 * Read the current cart token from the session cookie.
 * Returns undefined if no cart has been created yet.
 */
export async function getCartToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(CART_COOKIE_NAME)?.value
}

/**
 * Persist a new cart token in the session cookie.
 * Only callable from Server Actions or Route Handlers.
 */
export async function setCartToken(token: string): Promise<void> {
  const store = await cookies()
  store.set(CART_COOKIE_NAME, token, COOKIE_OPTIONS)
}

/**
 * Remove the cart token cookie (e.g. after cart expiry or logout).
 * Only callable from Server Actions or Route Handlers.
 */
export async function clearCartToken(): Promise<void> {
  const store = await cookies()
  store.delete(CART_COOKIE_NAME)
}
