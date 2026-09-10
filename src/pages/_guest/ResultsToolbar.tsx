import type { ReactNode } from 'react'
import { List, SquaresFour } from '@phosphor-icons/react'
import { FilterChip } from '@/components/data-display'
import { ChevronDownIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

export interface ResultsToolbarProps {
  /** e.g. "9 of 168 events" */
  countLabel: string
  activeFilter?: string
  onClearFilter?: () => void
  sortLabel?: string
  sortValue?: string
  /** When omitted, the sort shell is visually disabled (honest chrome). */
  onSortClick?: () => void
  showViewToggle?: boolean
  view?: 'grid' | 'list'
  onViewChange?: (view: 'grid' | 'list') => void
  /** Extra controls on the right (e.g. search sort pills). */
  trailing?: ReactNode
  className?: string
}

/** Results column toolbar: count + active chip + sort + optional view toggle. */
export function ResultsToolbar({
  countLabel,
  activeFilter,
  onClearFilter,
  sortLabel = 'Sort',
  sortValue = 'Date — soonest',
  onSortClick,
  showViewToggle = true,
  view = 'grid',
  onViewChange,
  trailing,
  className,
}: ResultsToolbarProps) {
  const sortEnabled = Boolean(onSortClick)
  const viewEnabled = Boolean(onViewChange)

  return (
    <div className={cn('flex w-full items-center justify-between gap-lg', className)}>
      <div className="flex items-center gap-row-gap">
        <p className="text-[15px] font-normal whitespace-nowrap text-ink-secondary">
          {countLabel}
        </p>
        {activeFilter && (
          <FilterChip removable onRemove={onClearFilter}>
            {activeFilter}
          </FilterChip>
        )}
      </div>

      <div className="flex items-center gap-row-gap">
        {trailing ?? (
          <>
            <button
              type="button"
              disabled={!sortEnabled}
              onClick={onSortClick}
              title={sortEnabled ? undefined : 'Sorting not available yet'}
              className={cn(
                'flex h-[38px] items-center gap-sm rounded-[19px] border border-border-default bg-surface-default px-md',
                !sortEnabled && 'cursor-not-allowed opacity-55',
              )}
            >
              <span className="text-[13px] text-ink-muted">{sortLabel}</span>
              <span className="text-[14px] font-medium text-ink-primary">{sortValue}</span>
              <ChevronDownIcon size={12} className="text-ink-primary" />
            </button>

            {showViewToggle && (
              <div
                className={cn(
                  'flex items-center gap-xs rounded-[19px] border border-border-default bg-surface-default p-xs',
                  !viewEnabled && 'cursor-not-allowed opacity-55',
                )}
                title={viewEnabled ? undefined : 'View toggle not available yet'}
              >
                <button
                  type="button"
                  aria-label="Grid view"
                  aria-pressed={view === 'grid'}
                  disabled={!viewEnabled}
                  onClick={() => onViewChange?.('grid')}
                  className={cn(
                    'flex h-[30px] w-[32px] items-center justify-center rounded-[15px] disabled:cursor-not-allowed',
                    view === 'grid'
                      ? 'bg-identity-gradient text-ink-inverse'
                      : 'text-ink-primary',
                  )}
                >
                  <SquaresFour size={13} weight="bold" />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={view === 'list'}
                  disabled={!viewEnabled}
                  onClick={() => onViewChange?.('list')}
                  className={cn(
                    'flex h-[30px] w-[32px] items-center justify-center rounded-[15px] disabled:cursor-not-allowed',
                    view === 'list'
                      ? 'bg-identity-gradient text-ink-inverse'
                      : 'text-ink-primary',
                  )}
                >
                  <List size={13} weight="bold" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
