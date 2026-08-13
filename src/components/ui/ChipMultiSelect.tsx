import { FilterChip } from '@/components/data-display'
import { FieldLabel } from '@/components/ui/Field'
import { cn } from '@/lib/cn'

export interface ChipMultiSelectProps {
  label?: string
  options: readonly string[]
  value: string[]
  onChange: (next: string[]) => void
  className?: string
  hint?: string
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
  function toggle(option: string) {
    onChange(
      value.includes(option) ? value.filter((item) => item !== option) : [...value, option],
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {label && <FieldLabel className="mb-[7px]">{label}</FieldLabel>}
      {hint && <p className="mb-[10px] text-[13px] text-ink-secondary">{hint}</p>}
      <div className="flex flex-wrap gap-[8px]">
        {options.map((option) => (
          <FilterChip
            key={option}
            selected={value.includes(option)}
            onClick={() => toggle(option)}
          >
            {option}
          </FilterChip>
        ))}
      </div>
    </div>
  )
}
