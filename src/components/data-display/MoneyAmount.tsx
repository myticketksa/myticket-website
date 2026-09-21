import type { HTMLAttributes, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { SarSymbol } from '@/components/icons/SarSymbol'
import { cn } from '@/lib/cn'

const CURRENCY_TOKEN =
  /(?:SAR|SR|RS|﷼|⃁|ر\.?\s*س\.?)/i

/** Strip legacy SAR / ر.س / RS tokens and optional From/من labels from price strings. */
export function parseMoneyDisplay(value: unknown): {
  kind: 'free' | 'empty' | 'amount' | 'plain'
  /** Formatted figure without currency (e.g. "1,240.00"). */
  amount?: string
  /** Leading label such as "From" / "من". */
  prefix?: string
  /** Trailing mark such as "+". */
  suffix?: string
  /** Unparsed text when not monetary. */
  plain?: string
} {
  if (value == null || value === '') return { kind: 'empty' }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return { kind: 'empty' }
    if (value === 0) return { kind: 'free' }
    return {
      kind: 'amount',
      amount: value.toLocaleString('en-SA', {
        maximumFractionDigits: value % 1 === 0 ? 0 : 2,
      }),
    }
  }

  const raw = String(value).trim()
  if (!raw) return { kind: 'empty' }
  if (/^(free|مجاني|مجانية|مجانى)$/i.test(raw)) return { kind: 'free' }

  const match = raw.match(
    new RegExp(
      `^(?:(From|من)\\s+)?${CURRENCY_TOKEN.source}\\s*([\\d,]+(?:\\.\\d+)?)\\s*(\\+)?$`,
      'i',
    ),
  )
  if (match) {
    return {
      kind: 'amount',
      prefix: match[1] || undefined,
      amount: match[2],
      suffix: match[3] || undefined,
    }
  }

  // Signed wallet deltas: "+ SAR 12.00" / "− 14.00"
  const signed = raw.match(
    new RegExp(
      `^([+−-]\\s*)?${CURRENCY_TOKEN.source}?\\s*([\\d,]+(?:\\.\\d+)?)\\s*$`,
      'i',
    ),
  )
  if (signed && (CURRENCY_TOKEN.test(raw) || /^[+−-]/.test(raw))) {
    return {
      kind: 'amount',
      prefix: signed[1]?.trim() || undefined,
      amount: signed[2],
    }
  }

  // Bare number / already-stripped formatter output (optional leading From/من).
  const bare = raw.match(/^(?:(From|من)\s+)?([\d,]+(?:\.\d+)?)\s*(\+)?$/i)
  if (bare) {
    return {
      kind: 'amount',
      prefix: bare[1] || undefined,
      amount: bare[2],
      suffix: bare[3] || undefined,
    }
  }

  // "SAR —" / "ر.س —" fallbacks
  if (CURRENCY_TOKEN.test(raw) && /[—–-]/.test(raw)) {
    return { kind: 'empty' }
  }

  return { kind: 'plain', plain: raw }
}

export interface MoneyAmountProps extends HTMLAttributes<HTMLSpanElement> {
  /** Number or legacy string ("SAR 180", "From SAR 450", "Free"). */
  value: number | string | null | undefined
  /** Override free copy (defaults to common:currency.free). */
  freeLabel?: string
  /** When true, hide the currency mark (rare plain-number contexts). */
  hideSymbol?: boolean
  /** Extra node after the amount (e.g. "/ person"). */
  after?: ReactNode
}

/**
 * Saudi Riyal amount with the official currency mark.
 * Forces `dir="ltr"` so the figure stays left-to-right inside RTL layouts.
 */
export function MoneyAmount({
  value,
  freeLabel,
  hideSymbol = false,
  after,
  className,
  ...props
}: MoneyAmountProps) {
  const { t } = useTranslation('common')
  const parsed = parseMoneyDisplay(value)

  if (parsed.kind === 'free') {
    return (
      <span className={className} {...props}>
        {freeLabel ?? t('currency.free')}
      </span>
    )
  }

  if (parsed.kind === 'empty') {
    return (
      <span
        className={cn('inline-flex items-center gap-[0.2em] tabular-nums', className)}
        dir="ltr"
        {...props}
      >
        {!hideSymbol ? <SarSymbol /> : null}
        <span>—</span>
        {after}
      </span>
    )
  }

  if (parsed.kind === 'plain') {
    return (
      <span className={className} {...props}>
        {parsed.plain}
        {after}
      </span>
    )
  }

  return (
    <span
      className={cn('inline-flex items-center gap-[0.2em] tabular-nums', className)}
      dir="ltr"
      title={t('currency.sarName')}
      {...props}
    >
      {parsed.prefix ? <span className="me-[0.15em]">{parsed.prefix}</span> : null}
      {!hideSymbol ? <SarSymbol /> : null}
      <span>{parsed.amount}</span>
      {parsed.suffix ? <span>{parsed.suffix}</span> : null}
      {after}
    </span>
  )
}
