import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Shared shell styling for the text-entry family — TextInput, Textarea, Select
 * and AmountInput all sit on the same box.
 *
 * Figma `TextInput` — node 207:1689. h48, px14, radius 12, Body/Default.
 * The resting border is 1px and both Focused and Error thicken it to 1.5px, so
 * the box grows inward by half a pixel on each side when focused. That is the
 * design; compensating for it would shift the text.
 */
export const fieldShell = [
  'w-full rounded-input bg-surface-default px-field-pad text-[15px] leading-[1.55]',
  'border border-border-default text-ink-primary',
  'transition-colors duration-normal ease-standard',
  'placeholder:text-ink-muted',
  'focus:border-[1.5px] focus:border-border-focus focus:outline-none',
  'disabled:cursor-not-allowed disabled:border-border-default disabled:bg-bg-skeleton disabled:text-ink-disabled disabled:placeholder:text-ink-disabled',
]

/** Error overrides the resting border and tints the fill. */
export const fieldError =
  'border-[1.5px] border-border-danger bg-state-danger-tint focus:border-border-danger'

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  invalid?: boolean
  /**
   * Rendered inside the field, before the input — the dial-code prefix and
   * divider on Sign In's mobile field, for example.
   *
   * Named `leading` rather than `prefix` because `prefix` is a real HTML
   * attribute typed as `string`, which a ReactNode cannot widen.
   */
  leading?: ReactNode
  /** Rendered inside the field, after the input. */
  trailing?: ReactNode
}

export function TextInput({ className, invalid, leading, trailing, ...props }: TextInputProps) {
  const input = (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        fieldShell,
        'h-input',
        invalid && fieldError,
        // When an affix is present the shell owns the box, so the input drops
        // its own chrome and just fills the remaining space.
        (leading || trailing) &&
          'h-full min-w-0 flex-1 border-0 bg-transparent px-0 focus:border-0 disabled:bg-transparent',
        className,
      )}
      {...props}
    />
  )

  if (!leading && !trailing) return input

  return (
    <div
      className={cn(
        fieldShell,
        'flex h-input items-center gap-control-gap',
        invalid && fieldError,
        'focus-within:border-[1.5px] focus-within:border-border-focus',
        invalid && 'focus-within:border-border-danger',
        className,
      )}
    >
      {leading}
      {input}
      {trailing}
    </div>
  )
}
