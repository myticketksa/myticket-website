import { NumberedPagination, type NumberedPaginationProps } from '@/components/navigation'

/**
 * @deprecated Prefer `NumberedPagination` from `@/components/navigation`.
 * Kept as a thin alias so existing catalog pages keep compiling.
 */
export function CatalogPager(props: NumberedPaginationProps) {
  return <NumberedPagination {...props} />
}

export type { NumberedPaginationProps as CatalogPagerProps }
