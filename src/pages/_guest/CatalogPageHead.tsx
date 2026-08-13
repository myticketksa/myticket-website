import type { ReactNode } from 'react'
import { FilterChip } from '@/components/data-display'
import { HeartGlyphIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

export interface CatalogChip {
  label: string
  selected?: boolean
}

export interface CatalogPageHeadProps {
  title: string
  subtitle: string
  chips?: CatalogChip[]
  onChipSelect?: (label: string) => void
  /** Secondary + primary actions on the right of the title row (Events pattern). */
  actions?: ReactNode
  /** Optional eyebrow above the H1 (Talents / Vendors / Auction). */
  eyebrow?: string
  className?: string
}

/** Breadcrumb → PageHead (H1 + sub + actions + FilterChip row). */
export function CatalogPageHead({
  title,
  subtitle,
  chips,
  onChipSelect,
  actions,
  eyebrow,
  className,
}: CatalogPageHeadProps) {
  return (
    <div className={cn('flex w-full flex-col', className)}>
      {eyebrow && (
        <p className="text-label-overline mb-sm text-ink-brand-mid">{eyebrow}</p>
      )}

      <div className="flex w-full items-end justify-between gap-4xl">
        <div className="min-w-0 flex-1">
          <h1 className="text-display-hero text-ink-primary">{title}</h1>
          <p className="mt-[10px] max-w-[620px] text-[17px] leading-[1.45] font-normal text-ink-secondary">
            {subtitle}
          </p>
        </div>
        {actions}
      </div>

      {chips && chips.length > 0 && (
        <div className="mt-[22px] flex w-full flex-wrap gap-[9px]">
          {chips.map((chip) => (
            <FilterChip
              key={chip.label}
              selected={chip.selected}
              onClick={() => onChipSelect?.(chip.label)}
            >
              {chip.label}
            </FilterChip>
          ))}
        </div>
      )}
    </div>
  )
}

export function CatalogSaveAlertActions({
  saveLabel = 'Save this search',
  alertLabel = 'Alert me on new concerts',
}: {
  saveLabel?: string
  alertLabel?: string
}) {
  return (
    <div className="flex shrink-0 gap-[10px]">
      <Button variant="secondary" icon={<HeartGlyphIcon size={16} />}>
        {saveLabel}
      </Button>
      <Button>{alertLabel}</Button>
    </div>
  )
}
