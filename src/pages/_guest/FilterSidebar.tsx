import type { ReactNode } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import { FilterChip } from '@/components/data-display'
import { Checkbox } from '@/components/ui'
import { cn } from '@/lib/cn'
import {
  CITY_FACETS,
  OTHER_FILTERS,
  RATING_OPTIONS,
  WHEN_OPTIONS,
} from './fixtures'

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
  when: string
  cities: string[]
  rating: string
  other: string[]
  /** Inclusive max ticket price in SAR; default 1500. */
  maxPrice: number
}

export interface FilterSidebarProps {
  title?: string
  clearLabel?: string
  onClear?: () => void
  /** Fired when default-shell filter state changes (and on clear). */
  onChange?: (state: FilterSidebarState) => void
  /** When omitted, Events defaults (When / City / Price / Rating / Other). */
  groups?: FilterGroup[]
  width?: 268 | 252 | 244
  className?: string
  children?: ReactNode
  /**
   * When false, shell controls look inactive (no unexplained dead interactivity).
   * Default true — pages that pass onChange should keep interactive.
   */
  interactive?: boolean
}

const FREE_ENTRY = 'Free entry only'
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
  title = 'Filters',
  clearLabel = 'Clear all',
  onClear,
  onChange,
  groups,
  width = 268,
  className,
  children,
  interactive = true,
}: FilterSidebarProps) {
  const baseId = useId()
  const [when, setWhen] = useState('Any date')
  const [rating, setRating] = useState('Any')
  const [cities, setCities] = useState<string[]>([])
  const [other, setOther] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    onChangeRef.current?.({ when, cities, rating, other, maxPrice })
  }, [when, cities, rating, other, maxPrice])

  const toggle = (list: string[], value: string, set: (next: string[]) => void) => {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const clear = () => {
    setWhen('Any date')
    setRating('Any')
    setCities([])
    setOther([])
    setMaxPrice(PRICE_MAX)
    onClear?.()
  }

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col gap-[22px] rounded-[18px] border border-border-default bg-surface-default p-xl',
        className,
      )}
      style={{ width }}
    >
      <div className="flex w-full items-center justify-between">
        <p className="text-[16px] font-semibold text-ink-primary">{title}</p>
        <button
          type="button"
          disabled={!interactive}
          onClick={clear}
          className="text-[13px] font-semibold text-ink-brand disabled:cursor-not-allowed disabled:text-ink-disabled"
        >
          {clearLabel}
        </button>
      </div>

      {children ??
        (groups ? (
          groups.map((group) => (
            <div key={group.id} className="flex w-full flex-col">
              <div className="mb-md flex items-baseline justify-between">
                <FilterGroupLabel>{group.label}</FilterGroupLabel>
                {group.trailing}
              </div>
              {group.kind === 'chips' && (
                <div className="flex flex-wrap gap-[7px]">
                  {group.options?.map((opt) => (
                    <FilterChip
                      key={opt.label}
                      selected={group.selected === opt.label}
                      disabled={!interactive}
                      className="h-[32px] rounded-[16px] px-md text-[13px] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {opt.label}
                    </FilterChip>
                  ))}
                </div>
              )}
              {group.kind === 'checks' && (
                <div className="flex flex-col gap-[9px]">
                  {group.options?.map((opt, i) => (
                    <Checkbox
                      key={opt.label}
                      id={`${baseId}-${group.id}-${i}`}
                      label={opt.label}
                      count={opt.count}
                      fullWidth
                      disabled={!interactive}
                    />
                  ))}
                </div>
              )}
              {group.kind === 'rating' && (
                <div className="flex flex-wrap gap-[7px]">
                  {group.options?.map((opt) => (
                    <FilterChip
                      key={opt.label}
                      selected={group.selected === opt.label}
                      disabled={!interactive}
                      className="h-[34px] min-w-0 flex-1 rounded-[9px] px-md text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {opt.label}
                    </FilterChip>
                  ))}
                </div>
              )}
              {group.kind === 'price' && <PriceSlider disabled={!interactive} />}
              {group.kind === 'custom' && group.trailing}
            </div>
          ))
        ) : (
          <>
            <div className="flex w-full flex-col">
              <FilterGroupLabel>When</FilterGroupLabel>
              <div className="mt-md flex flex-wrap gap-[7px]">
                {WHEN_OPTIONS.map((opt) => (
                  <FilterChip
                    key={opt}
                    selected={when === opt}
                    disabled={!interactive}
                    onClick={() => interactive && setWhen(opt)}
                    className="h-[32px] rounded-[16px] px-md text-[13px] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {opt}
                  </FilterChip>
                ))}
              </div>
              {/* Date shells — decorative until a real date picker is wired. */}
              <div className="mt-row-gap flex gap-sm" title="Date range not available yet">
                <div
                  aria-disabled="true"
                  className="flex h-[36px] flex-1 cursor-not-allowed items-center rounded-[9px] border border-border-default bg-bg-skeleton px-row-gap text-[13px] text-ink-disabled"
                >
                  dd/mm/yyyy
                </div>
                <div
                  aria-disabled="true"
                  className="flex h-[36px] flex-1 cursor-not-allowed items-center rounded-[9px] border border-border-default bg-bg-skeleton px-row-gap text-[13px] text-ink-disabled"
                >
                  dd/mm/yyyy
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-border-divider" />

            <div className="flex w-full flex-col">
              <FilterGroupLabel>City</FilterGroupLabel>
              <div className="mt-md flex flex-col gap-[9px]">
                {CITY_FACETS.map((city, i) => (
                  <Checkbox
                    key={city.label}
                    id={`${baseId}-city-${i}`}
                    label={city.label}
                    count={city.count}
                    fullWidth
                    disabled={!interactive}
                    checked={cities.includes(city.label)}
                    onCheckedChange={() =>
                      interactive && toggle(cities, city.label, setCities)
                    }
                  />
                ))}
              </div>
            </div>

            <div className="h-px w-full bg-border-divider" />

            <div className="flex w-full flex-col">
              <div className="flex items-baseline justify-between">
                <FilterGroupLabel>Price</FilterGroupLabel>
                <p className="text-[13px] text-ink-secondary">
                  Up to SAR {maxPrice >= PRICE_MAX ? '1,500+' : maxPrice.toLocaleString('en-US')}
                </p>
              </div>
              <PriceSlider
                className="mt-[14px]"
                value={maxPrice}
                disabled={!interactive}
                onChange={setMaxPrice}
              />
              <div className="mt-md">
                <Checkbox
                  id={`${baseId}-free`}
                  label={FREE_ENTRY}
                  fullWidth
                  disabled={!interactive}
                  checked={other.includes(FREE_ENTRY)}
                  onCheckedChange={() =>
                    interactive && toggle(other, FREE_ENTRY, setOther)
                  }
                />
              </div>
            </div>

            <div className="h-px w-full bg-border-divider" />

            <div className="flex w-full flex-col">
              <FilterGroupLabel>Rating</FilterGroupLabel>
              <div className="mt-md flex gap-[7px]">
                {RATING_OPTIONS.map((opt) => (
                  <FilterChip
                    key={opt}
                    selected={rating === opt}
                    disabled={!interactive}
                    onClick={() => interactive && setRating(opt)}
                    className="h-[34px] min-w-0 flex-1 rounded-[9px] px-md text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {opt}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="h-px w-full bg-border-divider" />

            <div className="flex w-full flex-col">
              <FilterGroupLabel>Other</FilterGroupLabel>
              <div className="mt-md flex flex-col gap-[9px]">
                {OTHER_FILTERS.map((label, i) => (
                  <Checkbox
                    key={label}
                    id={`${baseId}-other-${i}`}
                    label={label}
                    fullWidth
                    disabled={!interactive}
                    checked={other.includes(label)}
                    onCheckedChange={() =>
                      interactive && toggle(other, label, setOther)
                    }
                  />
                ))}
              </div>
            </div>
          </>
        ))}
    </aside>
  )
}

/** Max-price rail — Figma filled track; thumb position maps 50–1500 SAR. */
function PriceSlider({
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
          aria-label="Maximum price"
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed [&::-webkit-slider-thumb]:size-[14px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-primary [&::-webkit-slider-thumb]:bg-surface-default"
        />
      </div>
      <div className="mt-xs flex justify-between text-[12px] text-ink-muted">
        <span>SAR {PRICE_MIN}</span>
        <span>SAR 1,500+</span>
      </div>
    </div>
  )
}
