import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

/**
 * Numbered pager drawn on Events / Talents / catalog frames (`207:4771`).
 *
 * Distinct from `Pagination` (`207:2852`), which is load-more only. Prev/Next are h38
 * pills with 1.5px `--border-default`; page cells are 38×38. Active uses
 * `--gradient-identity`.
 */
export interface NumberedPaginationProps {
  page?: number
  pages?: number[]
  onPageChange?: (page: number) => void
  className?: string
}

export function NumberedPagination({
  page = 1,
  pages = [1, 2, 3, 4, 19],
  onPageChange,
  className,
}: NumberedPaginationProps) {
  const first = pages[0] ?? 1
  const last = pages[pages.length - 1] ?? first

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex w-full flex-wrap items-center justify-center gap-sm', className)}
    >
      <button
        type="button"
        disabled={page <= first}
        onClick={() => onPageChange?.(Math.max(first, page - 1))}
        className="inline-flex h-[38px] items-center gap-[6px] rounded-[19px] border-[1.5px] border-border-default bg-surface-default px-[14px] text-[13.5px] font-semibold text-ink-primary disabled:opacity-40"
      >
        <ArrowLeftIcon size={14} />
        Previous
      </button>

      {pages.map((n) => (
        <button
          key={n}
          type="button"
          aria-current={n === page ? 'page' : undefined}
          onClick={() => onPageChange?.(n)}
          className={cn(
            'inline-flex size-[38px] items-center justify-center rounded-[19px] text-[13.5px] font-semibold',
            n === page
              ? 'bg-identity-gradient font-bold text-ink-inverse'
              : 'border-[1.5px] border-border-default bg-surface-default text-ink-secondary',
          )}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        disabled={page >= last}
        onClick={() => onPageChange?.(Math.min(last, page + 1))}
        className="inline-flex h-[38px] items-center gap-[6px] rounded-[19px] border-[1.5px] border-border-default bg-surface-default px-[14px] text-[13.5px] font-semibold text-ink-primary disabled:opacity-40"
      >
        Next
        <ArrowRightIcon size={14} />
      </button>
    </nav>
  )
}
