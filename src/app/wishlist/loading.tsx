export default function WishlistLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-hidden="true">
      {/* Heading */}
      <div className="mb-8">
        <div className="h-8 w-28 skeleton rounded" />
        {/* Description line */}
        <div className="mt-1 h-5 w-48 skeleton rounded" />
      </div>

      {/* Product card grid — matches grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
            {/* aspect-square image */}
            <div className="aspect-square w-full skeleton" />
            {/* Info — mirrors flex flex-col gap-3 p-4 */}
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div>
                {/* Name: text-sm line-clamp-2 → two lines */}
                <div className="h-5 w-full skeleton rounded" />
                <div className="mt-1 h-5 w-2/3 skeleton rounded" />
                {/* Price: mt-1 text-sm */}
                <div className="mt-1 h-5 w-1/3 skeleton rounded" />
              </div>
              {/* View Product button: mt-auto h-9 */}
              <div className="mt-auto h-9 w-full skeleton rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
