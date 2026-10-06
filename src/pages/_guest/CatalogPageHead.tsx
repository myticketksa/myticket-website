import type { ReactNode } from 'react'
import { HeartGlyphIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

export interface CatalogPageHeadProps {
  title: string
  subtitle?: string
  /** Filter controls under the title (dropdowns — not a chip strip). */
  filters?: ReactNode
  /** Secondary + primary actions on the right of the title row (Events pattern). */
  actions?: ReactNode
  /** Optional eyebrow above the H1 (Talents / Facilities / Auction). */
  eyebrow?: string
  className?: string
}

/** Breadcrumb → PageHead (H1 + sub + actions + filter row). */
export function CatalogPageHead({
  title,
  subtitle,
  filters,
  actions,
  eyebrow,
  className,
}: CatalogPageHeadProps) {
  return (
    <div className={cn('flex w-full flex-col', className)}>
      {eyebrow && (
        <p className="text-label-overline mb-sm text-ink-brand-mid">{eyebrow}</p>
      )}

      <div className="flex w-full flex-col items-start gap-lg sm:flex-row sm:items-end sm:justify-between sm:gap-4xl">
        <div className="min-w-0 flex-1">
          <h1 className="text-display-hero text-ink-primary">{title}</h1>
          {subtitle ? (
            <p className="mt-[10px] max-w-[620px] text-[17px] leading-[1.45] font-normal text-ink-secondary">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions && <div className="w-full shrink-0 sm:w-auto">{actions}</div>}
      </div>

      {filters ? (
        <div className="mt-[22px] flex w-full flex-wrap items-center gap-[9px]">
          {filters}
        </div>
      ) : null}
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
    <div className="flex w-full shrink-0 flex-col gap-[10px] sm:w-auto sm:flex-row">
      <Button variant="secondary" icon={<HeartGlyphIcon size={16} />} className="w-full sm:w-auto">
        {saveLabel}
      </Button>
      <Button className="w-full sm:w-auto">{alertLabel}</Button>
    </div>
  )
}
