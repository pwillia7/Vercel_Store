import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Partial Pre-Rendering (formerly ppr, renamed to cacheComponents in Next.js 16).
  // Enables the static-shell + streaming-holes model globally.
  // Pages with Suspense boundaries get their static content pre-rendered;
  // dynamic holes (CartBadge, ProductActions) stream in afterward.
  cacheComponents: true,
  experimental: {
    // Enable "use cache" directive, cacheTag, cacheLife APIs
    useCache: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
