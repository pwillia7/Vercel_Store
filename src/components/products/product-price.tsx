import { getProductPrice } from '@/lib/api/client'
import { formatPrice } from '@/lib/format/currency'

export async function ProductPrice({ productId }: { productId: string }) {
  const price = await getProductPrice(productId)
  return <p className="text-2xl font-semibold text-white">{formatPrice(price)}</p>
}

export function ProductPriceSkeleton() {
  return <div className="h-8 w-28 skeleton rounded" aria-hidden="true" />
}
