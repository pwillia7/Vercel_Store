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
│  HomePage (page.tsx) — synchronous, no top-level awaits             │
│                                                                      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  ░  PromoBanner  (dynamic — no use cache)                        ░   │
│  ░  getPromotion()  ·  use cache: remote  ·  revalidate: 60s    ░   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                                      │
│  Hero  (static JSX — Vercel triangle SVG, no data fetch)            │
│                                                                      │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│  ▓  FeaturedProducts                                             ▓   │
│  ▓  use cache  ·  hours  ·  tag: products                        ▓   │
│  ▓  └── getProducts()  ·  use cache: remote  ·  hours           ▓   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│                                                                      │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│  ▓  RecentlyViewedSection                                        ▓   │
│  ▓  use cache  ·  days  (feature flag check only)               ▓   │
│  ▓  └── [ RecentlyViewedDisplay ]  ·  CLIENT  ·  localStorage   ▓   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
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
│  SearchPage (page.tsx)                                               │
│  getProducts()  ·  use cache: remote  ·  hours                      │
│  └── <link rel="preload"> for first product image (LCP)             │
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
│  └── <link rel="preload"> for first category product image (LCP)    │
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
│  getStoreConfig()  ·  use cache: remote  ·  days                    │
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
│ STREAMING — static shell + deferred cart content                     │
│                                                                      │
│  CartPage (synchronous)                                              │
│  └── "Your Cart" h1  ·  STATIC SHELL  ·  streams with first chunk   │
│                                                                      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  ░  CartContent  (async, Suspense-deferred)                      ░   │
│  ░  getCartToken()  ·  reads cookie  ·  LIVE                     ░   │
│  ░  getCart(token)  ·  LIVE                                      ░   │
│  ░  CartItemRow  ·  'use client'                                 ░   │
│  ░  CartSummary  ·  server component, live data                  ░   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                                      │
│  loading.tsx  ·  router-level skeleton, prefetched for instant nav  │
│                                                                      │
│  Mutations (Server Actions) call:                                   │
│  revalidatePath('/', 'layout')  — refreshes cart badge count        │
│  revalidatePath('/cart')        — refreshes cart page               │
└──────────────────────────────────────────────────────────────────────┘
```

### TTFB / LCP

Previously `CartPage` awaited `getCartToken()` and `getCart(token)` at the top
level, so TTFB = cookie read + full cart API round trip and the h1 couldn't
paint until both resolved.

Now `CartPage` is synchronous. The "Your Cart" h1 is the LCP element — it
renders with the first HTML chunk. `CartContent` defers both awaits behind a
`<Suspense>` boundary and streams in the skeleton → real content transition.

### Why no `use cache` directive applies here

All three cache directives were evaluated and rejected:

**`use cache: remote`** — each cart is keyed by a unique session token, creating one
cache entry per user. The official docs explicitly flag this as a bad fit: "If cache
keys have mostly unique values per request (user-specific parameters), cache utilization
will be near-zero." Cart data also changes on every mutation, causing constant staleness.

**`use cache`** — in-memory LRU per serverless instance. The docs confirm that in
serverless environments cache entries typically don't persist across requests (each
request can hit a different instance). No meaningful hit rate for runtime cart data.

**`use cache: private`** — browser-only (never stored server-side), so it provides no
TTFB relief — the server still executes the function on every request. Its mandatory
≥30s stale window also conflicts with the mutation-then-navigate flow: a user who
adds an item and immediately visits `/cart` could see their stale (pre-mutation) cart.
Experimental and not appropriate for correctness-critical cart state.

The LIVE strategy with `revalidatePath` on every Server Action mutation is correct
and provides the freshness guarantee cart data requires. TTFB is addressed by
streaming, not caching.

---

## Data Layer Summary

| Function | Directive | TTL | Cache tag |
|---|---|---|---|
| `getProducts()` | `use cache: remote` | revalidate: 1hr | `products` |
| `getProductById(id)` | `use cache: remote` | revalidate: 1hr | `product:{id}`, `products` |
| `getProductPrice(id)` | `use cache: remote` | revalidate: 60s, expire: 1hr | `product:{id}` |
| `getCategories()` | `use cache: remote` | revalidate: 1hr | `categories` |
| `getStoreConfig()` | `use cache: remote` | revalidate: 1day | — |
| `getProductStock(id)` | none | LIVE | — |
| `getPromotion()` | `use cache: remote` | revalidate: 60s, expire: 1hr | — |
| `getCart(token)` | none | LIVE | — |
| `getHealth()` | none | LIVE | — |

---

## Homepage LCP

`FeaturedProducts` is a `'use cache'` component — it renders as part of the prerendered shell, not behind a Suspense boundary. `ProductGrid` receives `priorityCount={4}`, which sets `loading="eager"` and `fetchPriority="high"` on the first four product cards (the full first desktop row). Because these images are in the shell, `next/image` emits native preload hints for them automatically — no manual `<link rel="preload">` needed.

---

## Why `use cache: remote` vs `use cache`

Plain `use cache` is in-memory per serverless instance. On Vercel, each instance has its own ephemeral cache — concurrent instances each miss and hit the slow REST API independently. `use cache: remote` stores in a shared handler across all instances, so at most one API call per TTL window regardless of traffic.

**Rule:** data functions called at request-time use `use cache: remote`. `FeaturedProducts` and `Footer` use plain `use cache` because they cache the rendered RSC payload at build/ISR time as shell components, on top of the already-remote-cached data functions they call.

---

## On-Demand Invalidation

No webhooks are configured. All cache expiry is time-based.

If webhooks are added in future, the correct calls are:

```ts
revalidateTag('products')       // getProducts + getProductById (all) + FeaturedProducts
revalidateTag('product:id')     // getProductById(id) + getProductPrice(id) for one product
revalidateTag('categories')     // getCategories
```
