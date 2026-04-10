# Caching Strategy

## Legend

```
┌─────────────────────────────────────────────────────────┐
│  STATIC SHELL  │ Pre-rendered, served from CDN edge     │
│  ▓▓▓▓▓▓▓▓▓▓▓▓ │ Cached Server Component or data fn     │
│  ░░░░░░░░░░░░ │ Suspense dynamic hole (streams in)     │
│  [ CLIENT ]   │ 'use client' — runs in browser only    │
│  LIVE          │ No cache — always fetches fresh        │
└─────────────────────────────────────────────────────────┘

Cache directives:
  use cache          → in-memory LRU, per serverless instance
  use cache: remote  → shared remote handler, all instances
```

---

## Global Layout (every page)

```
┌──────────────────────────────────────────────────────────────────────┐
│ STATIC SHELL                                                         │
│                                                                      │
│  ┌─ Header ─────────────────────────────────────────────────────┐   │
│  │  getStoreConfig()  ·  use cache: remote  ·  days             │   │
│  │  getFeatureFlags() ·  (calls getStoreConfig, free)           │   │
│  │                                                               │   │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │   │
│  │  ░  CartBadge — reads session cookie  ·  LIVE               ░  │   │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  { page content — see per-page diagrams below }                     │
│                                                                      │
│  ┌─ Footer ──────────────────────────────────────────────────────┐   │
│  │  use cache  ·  days                                           │   │
│  │  getStoreConfig()  ·  use cache: remote  ·  days             │   │
│  └───────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Home Page — `/`

```
┌──────────────────────────────────────────────────────────────────────┐
│ STATIC SHELL                                                         │
│                                                                      │
│  HomePage (page.tsx)                                                 │
│  getProducts()  ·  use cache: remote  ·  hours                      │
│  └── <link rel="preload"> for first featured product image (LCP)    │
│                                                                      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  ░  PromoBanner                                                  ░   │
│  ░  getPromotion()  ·  use cache: remote  ·  revalidate: 60s    ░   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                                      │
│  Hero  (static JSX — Vercel triangle SVG, no data fetch)            │
│                                                                      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  ░  FeaturedProducts                                             ░   │
│  ░  use cache  ·  hours  ·  tag: products                        ░   │
│  ░  └── getProducts()  ·  use cache: remote  ·  hours           ░   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                                      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  ░  RecentlyViewedSection                                        ░   │
│  ░  use cache  ·  weeks  (feature flag check only)              ░   │
│  ░  └── [ RecentlyViewedDisplay ]  ·  CLIENT  ·  localStorage   ░   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                                      │
│  ProductCard images:                                                 │
│  loading="eager" fetchPriority="high" on first 4 (above fold)       │
│  loading="lazy" on the rest                                          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Product Detail Page — `/products/[slug]`

Pre-built at deploy time via `generateStaticParams` → `getProducts()`.

```
┌──────────────────────────────────────────────────────────────────────┐
│ STATIC SHELL                                                         │
│                                                                      │
│  ProductDetail                                                       │
│  ├── getProductById()  ·  use cache: remote  ·  hours               │
│  │   └── name, category, description, tags                          │
│  │                                                                   │
│  ├── Image (hero)  ·  preload  ·  AVIF/WebP  ·  minimumCacheTTL 31d │
│  │                                                                   │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ├─░  ProductPrice                                               ░  │
│  │  ░  getProductPrice()  ·  use cache: remote                   ░  │
│  │  ░  stale: 60s  ·  revalidate: 60s  ·  expire: 1hr           ░  │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  │                                                                   │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  └─░  ProductActions                                             ░  │
│     ░  getProductStock()  ·  LIVE                                ░  │
│     ░  └── stock badge, quantity selector, add-to-cart           ░  │
│     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Search Page — `/search`

```
┌──────────────────────────────────────────────────────────────────────┐
│ STATIC SHELL                                                         │
│                                                                      │
│  (page wrapper only — no data in shell)                             │
│                                                                      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  ░  SearchContent  (awaits searchParams → dynamic boundary)      ░   │
│  ░                                                               ░   │
│  ░  getProducts()    ·  use cache: remote  ·  hours             ░   │
│  ░  getCategories()  ·  use cache: remote  ·  hours             ░   │
│  ░                                                               ░   │
│  ░  All filtering (query, category, tags, pagination)           ░   │
│  ░  runs in-memory on the cached product list                   ░   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                                      │
│  ProductCard images:                                                 │
│  loading="eager" fetchPriority="high" on first 4 (above fold)       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Category List Page — `/categories`

```
┌──────────────────────────────────────────────────────────────────────┐
│ STATIC SHELL                                                         │
│                                                                      │
│  CategoriesPage                                                      │
│  use cache  ·  hours  ·  tags: categories, products                 │
│  ├── getCategories()  ·  use cache: remote  ·  hours                │
│  └── getProducts()    ·  use cache: remote  ·  hours                │
│      (per-category counts computed in-memory, RSC payload cached)   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Category Detail Page — `/categories/[slug]`

Pre-built at deploy time via `generateStaticParams` → `getCategories()`.

```
┌──────────────────────────────────────────────────────────────────────┐
│ STATIC SHELL                                                         │
│                                                                      │
│  Breadcrumb + category header + product count                       │
│  getCategories()  ·  use cache: remote  ·  hours                    │
│  getProducts()    ·  use cache: remote  ·  hours                    │
│                                                                      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  ░  CategoryFilterContent  (awaits searchParams → dynamic)       ░   │
│  ░                                                               ░   │
│  ░  getProducts()  ·  use cache: remote  ·  hours               ░   │
│  ░  All filtering (query, tags) runs in-memory                  ░   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                                      │
│  ProductCard images:                                                 │
│  loading="eager" fetchPriority="high" on first 3 (above fold)       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Wishlist Page — `/wishlist`

```
┌──────────────────────────────────────────────────────────────────────┐
│ STATIC SHELL                                                         │
│                                                                      │
│  Feature flag gate                                                   │
│  getFeatureFlags()  ·  (calls getStoreConfig, remote  ·  days)      │
│  Returns 404 if wishlist flag is off                                 │
│                                                                      │
│  [ WishlistDisplay ]  ·  CLIENT  ·  reads localStorage              │
│  └── [ CompareTable ]  ·  CLIENT  ·  in-state data from wishlist    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Cart Page — `/cart`

```
┌──────────────────────────────────────────────────────────────────────┐
│ FULLY DYNAMIC (reads session cookie — no static shell)               │
│                                                                      │
│  getCartToken()  ·  reads cookie  ·  LIVE                           │
│  getCart(token)  ·  LIVE                                             │
│  CartItemRow     ·  server component, live cart data                │
│  CartSummary     ·  server component, live cart data                │
│                                                                      │
│  Mutations (Server Actions) call:                                   │
│  revalidatePath('/', 'layout')  — refreshes cart badge count        │
│  revalidatePath('/cart')        — refreshes cart page               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Layer Summary

| Function | Directive | TTL | Cache tag |
|---|---|---|---|
| `getProducts()` | `use cache: remote` | revalidate: 1hr | `products` |
| `getProductById(id)` | `use cache: remote` | revalidate: 1hr | `product:{id}`, `products` |
| `getProductPrice(id)` | `use cache: remote` | revalidate: 60s, expire: 1hr | `product:{id}` |
| `getCategories()` | `use cache: remote` | revalidate: 1day | `categories` |
| `getStoreConfig()` | `use cache: remote` | revalidate: 1day | — |
| `getProductStock(id)` | none | LIVE | — |
| `getPromotion()` | `use cache: remote` | revalidate: 60s, expire: 1hr | — |
| `getCart(token)` | none | LIVE | — |
| `getHealth()` | none | LIVE | — |

---

## Why `use cache: remote` vs `use cache`

Plain `use cache` is in-memory per serverless instance. On Vercel, each instance has its own ephemeral cache — concurrent instances each miss and hit the slow REST API independently. `use cache: remote` stores in a shared handler across all instances, so at most one API call per TTL window regardless of traffic.

**Rule:** anything called from a dynamic Suspense hole (request-time) uses `use cache: remote`.
`FeaturedProducts` and `Footer` use plain `use cache` because they are static shell components — their output is pre-rendered at build/ISR time, not per-request.

---

## On-Demand Invalidation

No webhooks are configured. All cache expiry is time-based.

If webhooks are added in future, the correct calls are:

```ts
revalidateTag('products')       // getProducts + getProductById (all) + FeaturedProducts
revalidateTag('product:id')     // getProductById(id) + getProductPrice(id) for one product
revalidateTag('categories')     // getCategories
```
