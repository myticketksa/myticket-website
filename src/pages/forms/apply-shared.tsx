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
    <div className="flex gap-[12px] rounded-[16px] border border-state-success-border bg-state-success-tint px-lg py-md sm:gap-[16px] sm:px-[20px] sm:py-[18px]">
      <div className="flex size-[40px] shrink-0 items-center justify-center rounded-[22px] bg-brand-gradient text-[14px] font-bold text-ink-inverse sm:size-[44px] sm:text-[15px]">
        {resolvedInitials}
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-state-success sm:text-[15px]">{resolvedTitle}</p>
        <p className="mt-[2px] text-[12px] text-pretty text-ink-secondary sm:text-[13px]">{subtitle}</p>
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
    <div className="rounded-[16px] border border-border-default bg-bg-page px-lg py-md sm:px-[18px] sm:py-[16px]">
      <p className="text-[14px] font-bold text-ink-primary">{t('review.heading')}</p>
      <dl className="mt-[12px] flex flex-col gap-[12px]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-[2px] text-[13.5px] sm:flex-row sm:items-start sm:justify-between sm:gap-[16px]"
          >
            <dt className="shrink-0 font-medium text-ink-muted">{row.label}</dt>
            <dd className="min-w-0 break-words font-semibold text-ink-primary sm:text-end">
              {row.value}
            </dd>
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
