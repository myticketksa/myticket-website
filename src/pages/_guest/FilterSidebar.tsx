import type { ReactNode } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MoneyAmount } from '@/components/data-display'
import { Checkbox, MultiSelectDropdown } from '@/components/ui'
import { cn } from '@/lib/cn'
import { catalogLabel } from '@/lib/i18n/catalogLabels'
import type { IdLabelOption } from '@/lib/api/formPayload'
import { CITY_FACETS } from './fixtures'

export interface FilterOption {
  label: string
  count?: string | number
}

export interface FilterGroup {
  id: string
  label: string
  kind: 'chips' | 'checks' | 'rating' | 'price' | 'custom'
  options?: FilterOption[]
  selected?: string
  trailing?: ReactNode
}

export type FilterSidebarState = {
  /** Single city id (mobile is single-select). Empty = any. */
  cityId: string
  freeOnly: boolean
}

export interface FilterSidebarProps {
  title?: string
  clearLabel?: string
  onClear?: () => void
  onChange?: (state: FilterSidebarState) => void
  groups?: FilterGroup[]
  /** Cities from `GET /generals/cities` — ids for `filters[city]` / `filters[in]`. */
  cityOptions?: IdLabelOption[]
  width?: 268 | 252 | 244
  className?: string
  children?: ReactNode
  interactive?: boolean
  /** Show free-entry checkbox (events). Default true. */
  showFreeOnly?: boolean
}

const PRICE_MIN = 50
const PRICE_MAX = 1500

function FilterGroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
      {children}
    </p>
  )
}

export function FilterSidebar({
  title,
  clearLabel,
  onClear,
  onChange,
  groups,
  cityOptions,
  width = 268,
  className,
  children,
  interactive = true,
  showFreeOnly = true,
}: FilterSidebarProps) {
  const { t } = useTranslation('catalog')
  const resolvedTitle = title ?? t('results.filters')
  const resolvedClear = clearLabel ?? t('results.clearAll')
  const baseId = useId()
  const [cityId, setCityId] = useState('')
  const [freeOnly, setFreeOnly] = useState(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const cities =
    cityOptions && cityOptions.length > 0
      ? cityOptions
      : CITY_FACETS.map((c) => ({ value: c.label, label: c.label }))

  useEffect(() => {
    onChangeRef.current?.({ cityId, freeOnly })
  }, [cityId, freeOnly])

  function handleClear() {
    setCityId('')
    setFreeOnly(false)
    onClear?.()
  }

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col gap-[22px] rounded-[18px] border border-border-default bg-surface-default p-lg',
        className,
      )}
      style={{ width }}
    >
      <div className="flex items-center justify-between gap-md">
        <p className="text-[15px] font-bold text-ink-primary">{resolvedTitle}</p>
        <button
          type="button"
          onClick={handleClear}
          className="text-[13px] font-semibold text-ink-brand hover:underline"
        >
          {resolvedClear}
        </button>
      </div>

      {children ??
        (groups ? null : (
          <>
            <div className="flex w-full flex-col">
              <FilterGroupLabel>{t('filters.city')}</FilterGroupLabel>
              <div className="mt-md">
                <MultiSelectDropdown
                  multi={false}
                  size="field"
                  allLabel={t('filters.anywhereSaudi')}
                  placeholder={t('filters.city')}
                  options={cities}
                  value={cityId ? [cityId] : []}
                  onChange={(next) => {
                    if (!interactive) return
                    setCityId(next[0] ?? '')
                  }}
                />
              </div>
            </div>

            {showFreeOnly ? (
              <>
                <div className="h-px w-full bg-border-divider" />
                <div className="flex w-full flex-col">
                  <Checkbox
                    id={`${baseId}-free`}
                    label={catalogLabel(t, 'Free entry only')}
                    fullWidth
                    disabled={!interactive}
                    checked={freeOnly}
                    onCheckedChange={(checked) =>
                      interactive && setFreeOnly(checked === true)
                    }
                  />
                </div>
              </>
            ) : null}
          </>
        ))}
    </aside>
  )
}

/** Kept for pages that still render a decorative price rail. */
export function PriceSlider({
  className,
  disabled = false,
  value = PRICE_MAX,
  onChange,
}: {
  className?: string
  disabled?: boolean
  value?: number
  onChange?: (value: number) => void
}) {
  const { t } = useTranslation('catalog')
  const pct = ((value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100

  return (
    <div
      className={cn('relative', className, disabled && 'cursor-not-allowed opacity-55')}
      aria-disabled={disabled}
    >
      <div className="relative h-4 w-full">
        <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded-[2px] bg-border-divider" />
        <div
          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-[2px] bg-brand-primary"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={25}
          value={value}
          disabled={disabled}
          aria-label={t('filters.maxPrice')}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed [&::-webkit-slider-thumb]:size-[14px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-primary [&::-webkit-slider-thumb]:bg-surface-default"
        />
      </div>
      <div className="mt-xs flex justify-between text-[12px] text-ink-muted">
        <MoneyAmount value={PRICE_MIN} />
        <MoneyAmount value={`${(1500).toLocaleString('en-US')}+`} />
      </div>
    </div>
  )
}
