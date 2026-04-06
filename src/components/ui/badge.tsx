interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
  className?: string
}

const variants = {
  default: 'bg-zinc-800 text-zinc-300',
  success: 'bg-emerald-950 text-emerald-400',
  warning: 'bg-yellow-950 text-yellow-400',
  error: 'bg-red-950 text-red-400',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
