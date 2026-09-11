import { FilterChip } from '@/components/data-display'
import { FieldLabel } from '@/components/ui/Field'
import { cn } from '@/lib/cn'
import type { IdLabelOption } from '@/lib/api/formPayload'

export type ChipOption = string | IdLabelOption

export interface ChipMultiSelectProps {
  label?: string
  options: readonly ChipOption[]
  /** Selected option values (ids when options are `{ value, label }`). */
  value: string[]
  onChange: (next: string[]) => void
  className?: string
  hint?: string
}

function optionValue(option: ChipOption): string {
  return typeof option === 'string' ? option : option.value
}

function optionLabel(option: ChipOption): string {
  return typeof option === 'string' ? option : option.label
}

/** Multi-select chip row for services / categories on apply wizards. */
export function ChipMultiSelect({
  label,
  options,
  value,
  onChange,
  className,
  hint,
}: ChipMultiSelectProps) {
  function toggle(option: ChipOption) {
    const key = optionValue(option)
    onChange(value.includes(key) ? value.filter((item) => item !== key) : [...value, key])
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {label && <FieldLabel className="mb-[7px]">{label}</FieldLabel>}
      {hint && <p className="mb-[10px] text-[13px] text-ink-secondary">{hint}</p>}
      <div className="flex flex-wrap gap-[8px]">
        {options.map((option) => {
          const key = optionValue(option)
          return (
            <FilterChip
              key={key}
              selected={value.includes(key)}
              onClick={() => toggle(option)}
            >
              {optionLabel(option)}
            </FilterChip>
          )
        })}
      </div>
    </div>
  )
}
