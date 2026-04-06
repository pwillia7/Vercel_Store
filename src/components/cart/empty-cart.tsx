import Link from 'next/link'

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 text-zinc-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-semibold text-white">Your cart is empty</h2>
      <p className="mb-8 text-zinc-400 max-w-sm">
        Looks like you haven&apos;t added anything yet. Browse our collection and find
        something you&apos;ll love.
      </p>
      <Link
        href="/search"
        className="inline-flex h-10 items-center rounded-md bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
      >
        Browse Products
      </Link>
    </div>
  )
}
