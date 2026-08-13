import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface CatalogBodyProps {
  filters: ReactNode
  children: ReactNode
  /** Filter column width — Events 268, Talents/Vendors 252, Search 244. */
  filterWidth?: 268 | 252 | 244
  className?: string
}

/** Body grid: filter sidebar + results column (gap 32). */
export function CatalogBody({
  filters,
  children,
  filterWidth = 268,
  className,
}: CatalogBodyProps) {
  return (
    <div className={cn('flex w-full items-start gap-4xl', className)} data-filter-width={filterWidth}>
      {filters}
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
