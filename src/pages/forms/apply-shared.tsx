import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Checkbox } from '@/components/ui'
import { useAppSelector } from '@/app/hooks'
import { selectAuthUser } from '@/features/auth/authSlice'
import i18n from '@/i18n/config'

function initialsFromName(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '—'
  )
}

export function AccountDonePanel({
  initials,
  title,
  subtitle,
}: {
  initials?: string
  title?: string
  subtitle: ReactNode
}) {
  const { t } = useTranslation('forms')
  const user = useAppSelector(selectAuthUser)
  const displayName = user?.name?.trim() || t('accountDone.fallbackName')
  const firstName = displayName.split(/\s+/)[0] || displayName
  const resolvedInitials = initials ?? (user?.name ? initialsFromName(user.name) : '—')
  const resolvedTitle = title ?? t('accountDone.title', { name: firstName })

  return (
    <div className="flex gap-[16px] rounded-[16px] border border-state-success-border bg-state-success-tint px-[20px] py-[18px]">
      <div className="flex size-[44px] shrink-0 items-center justify-center rounded-[22px] bg-brand-gradient text-[15px] font-bold text-ink-inverse">
        {resolvedInitials}
      </div>
      <div className="min-w-0">
        <p className="text-[15px] font-bold text-state-success">{resolvedTitle}</p>
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
  const { t } = useTranslation('forms')
  return (
    <div className="rounded-[16px] border border-border-default bg-bg-page px-[18px] py-[16px]">
      <p className="text-[14px] font-bold text-ink-primary">{t('review.heading')}</p>
      <dl className="mt-[12px] flex flex-col gap-[10px]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-[16px] text-[13.5px]"
          >
            <dt className="shrink-0 font-medium text-ink-muted">{row.label}</dt>
            <dd className="min-w-0 text-end font-semibold text-ink-primary">{row.value}</dd>
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

export function joinOrDash(values: string[], empty?: string) {
  return values.length > 0
    ? values.join(', ')
    : (empty ?? i18n.t('forms:review.notSet'))
}
