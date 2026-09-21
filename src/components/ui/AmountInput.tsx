import type { InputHTMLAttributes } from 'react'
import { SarSymbol } from '@/components/icons'
import { cn } from '@/lib/cn'

/**
 * Figma `AmountInput` — node 207:1747. h56, px16, gap 12, radius 14, and a
 * 1.5px `--border-brand`.
 *
 * Only one state is drawn, and it already carries the brand border that every
 * other field reserves for focus. Figma's description calls it
 * "focused-looking" and notes no default or error variant exists — so the brand
 * border is the resting appearance here, not a focus treatment.
 *
 * It also hugs its content: the source declares no width.
 */
export interface AmountInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  /** @deprecated Official SAR mark is always shown; kept for call-site compat. */
  currency?: string
}

export function AmountInput({ className, currency: _currency, ...props }: AmountInputProps) {
  return (
    <div
      className={cn(
        'inline-flex h-amount-input items-center gap-md rounded-control px-lg',
        'border-[1.5px] border-border-brand bg-surface-default',
        'focus-within:border-border-focus',
        className,
      )}
      dir="ltr"
    >
      <span className="shrink-0 text-ink-secondary" aria-hidden>
        <SarSymbol className="h-[1.05em] w-auto" />
      </span>
      <input
        type="text"
        inputMode="decimal"
        className={cn(
          'min-w-0 flex-1 border-0 bg-transparent p-0 text-numeric-default text-ink-primary',
          'placeholder:text-ink-muted focus:outline-none',
        )}
        {...props}
      />
    </div>
  )
}
