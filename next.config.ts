import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Partial Pre-Rendering (formerly ppr, renamed to cacheComponents in Next.js 16).
  // Enables the static-shell + streaming-holes model globally.
  // Pages with Suspense boundaries get their static content pre-rendered;
  // dynamic holes (CartBadge, ProductActions) stream in afterward.
  cacheComponents: true,
  images: {
    // qualities is required in Next.js 16 to prevent abuse of the optimization endpoint
    qualities: [75],
    // AVIF preferred (better compression for LCP), WebP as fallback
    formats: ['image/avif', 'image/webp'],
    // Product images don't change — 31 days prevents constant re-encoding on the slow REST API
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
