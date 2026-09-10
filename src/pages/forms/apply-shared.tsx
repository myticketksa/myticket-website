import type { ReactNode } from 'react'
import { Checkbox } from '@/components/ui'

export function AccountDonePanel({
  initials = 'SA',
  title = "This part's already done — you're signed in as Sara.",
  subtitle,
}: {
  initials?: string
  title?: string
  subtitle: ReactNode
}) {
  return (
    <div className="flex gap-[16px] rounded-[16px] border border-state-success-border bg-state-success-tint px-[20px] py-[18px]">
      <div className="flex size-[44px] shrink-0 items-center justify-center rounded-[22px] bg-brand-gradient text-[15px] font-bold text-ink-inverse">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-[15px] font-bold text-state-success">{title}</p>
        <p className="mt-[2px] text-[13px] text-ink-secondary">{subtitle}</p>
      </div>
    </div>
  )
}

/** Shared review helpers — kept for when apply steps 2–5 are designed. */
export function ReviewSummary({
  rows,
}: {
  rows: { label: string; value: string }[]
}) {
  return (
    <div className="rounded-[16px] border border-border-default bg-bg-page px-[18px] py-[16px]">
      <p className="text-[14px] font-bold text-ink-primary">What we&apos;ll review</p>
      <dl className="mt-[12px] flex flex-col gap-[10px]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-[16px] text-[13.5px]"
          >
            <dt className="shrink-0 font-medium text-ink-muted">{row.label}</dt>
            <dd className="min-w-0 text-right font-semibold text-ink-primary">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function ReviewTerms({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean
  onCheckedChange: (next: boolean) => void
  label: string
}) {
  return (
    <Checkbox
      id="apply-terms"
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      label={label}
      className="items-start gap-[10px] [&_label]:leading-[1.45]"
    />
  )
}

export function joinOrDash(values: string[], empty = 'Not set yet') {
  return values.length > 0 ? values.join(', ') : empty
}
