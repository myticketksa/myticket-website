import type { ReactNode } from 'react'
import { useId, useState } from 'react'
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

export interface FilterSidebarProps {
  title?: string
  clearLabel?: string
  onClear?: () => void
  /** When omitted, Events defaults (When / City / Price / Rating / Other). */
  groups?: FilterGroup[]
  width?: 268 | 252 | 244
  className?: string
  children?: ReactNode
}

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
  groups,
  width = 268,
  className,
  children,
}: FilterSidebarProps) {
  const baseId = useId()
  const [when, setWhen] = useState('Any date')
  const [rating, setRating] = useState('Any')
  const [cities, setCities] = useState<string[]>([])
  const [other, setOther] = useState<string[]>([])

  const toggle = (list: string[], value: string, set: (next: string[]) => void) => {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
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
          onClick={() => {
            setWhen('Any date')
            setRating('Any')
            setCities([])
            setOther([])
            onClear?.()
          }}
          className="text-[13px] font-semibold text-ink-brand"
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
                      className="h-[32px] rounded-[16px] px-md text-[13px]"
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
                      className="h-[34px] min-w-0 flex-1 rounded-[9px] px-md text-[13px] font-semibold"
                    >
                      {opt.label}
                    </FilterChip>
                  ))}
                </div>
              )}
              {group.kind === 'price' && <PriceSlider />}
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
                    onClick={() => setWhen(opt)}
                    className="h-[32px] rounded-[16px] px-md text-[13px]"
                  >
                    {opt}
                  </FilterChip>
                ))}
              </div>
              <div className="mt-row-gap flex gap-sm">
                <div className="flex h-[36px] flex-1 items-center rounded-[9px] border border-border-default bg-bg-page px-row-gap text-[13px] text-ink-muted">
                  dd/mm/yyyy
                </div>
                <div className="flex h-[36px] flex-1 items-center rounded-[9px] border border-border-default bg-bg-page px-row-gap text-[13px] text-ink-muted">
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
                    checked={cities.includes(city.label)}
                    onCheckedChange={() => toggle(cities, city.label, setCities)}
                  />
                ))}
              </div>
            </div>

            <div className="h-px w-full bg-border-divider" />

            <div className="flex w-full flex-col">
              <div className="flex items-baseline justify-between">
                <FilterGroupLabel>Price</FilterGroupLabel>
                <p className="text-[13px] text-ink-secondary">Up to SAR 1,500</p>
              </div>
              <PriceSlider className="mt-[14px]" />
              <div className="mt-md">
                <Checkbox id={`${baseId}-free`} label="Free entry only" fullWidth />
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
                    onClick={() => setRating(opt)}
                    className="h-[34px] min-w-0 flex-1 rounded-[9px] px-md text-[13px] font-semibold"
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
                    checked={other.includes(label)}
                    onCheckedChange={() => toggle(other, label, setOther)}
                  />
                ))}
              </div>
            </div>
          </>
        ))}
    </aside>
  )
}

function PriceSlider({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative h-4 w-full overflow-hidden">
        <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded-[2px] bg-brand-primary" />
        <div className="absolute top-1/2 right-0 size-[14px] -translate-y-1/2 rounded-full border-2 border-brand-primary bg-surface-default" />
      </div>
      <div className="mt-xs flex justify-between text-[12px] text-ink-muted">
        <span>SAR 50</span>
        <span>SAR 1,500+</span>
      </div>
    </div>
  )
}
