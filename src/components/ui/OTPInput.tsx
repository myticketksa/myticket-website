import { useId, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `OTPBox` — node 207:1743, and `OTPGroup` — node 207:2868.
 *
 * Each box is 48x56 with radius 12. Empty carries a 1px `--border-default`;
 * Filled switches to 1.5px `--border-brand` and centres the digit at 22px/700.
 *
 * That 22/700 is set directly rather than through `Numeric/Default`, which is
 * 22/600 — Figma's description flags the mismatch, so the weight here is
 * deliberate and not a drift from the text style.
 *
 * An error state is not drawn in the source. `invalid` therefore reuses the
 * danger border and tint established by TextInput rather than inventing a
 * treatment.
 */
export interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  invalid = false,
  disabled = false,
  className,
  'aria-label': ariaLabel = 'One-time code',
}: OTPInputProps) {
  const groupId = useId()
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const focusBox = (index: number) => {
    inputs.current[Math.min(Math.max(index, 0), length - 1)]?.focus()
  }

  const setDigit = (index: number, digit: string) => {
    const next = value.padEnd(length, ' ').split('')
    next[index] = digit
    onChange(next.join('').trimEnd())
  }

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return

    // Typing into a box overwrites it and advances. Pasting a run of digits
    // fills forward from the current box.
    if (digits.length === 1) {
      setDigit(index, digits)
      focusBox(index + 1)
      return
    }

    const next = value.padEnd(length, ' ').split('')
    for (let i = 0; i < digits.length && index + i < length; i += 1) {
      next[index + i] = digits[i]
    }
    onChange(next.join('').trimEnd())
    focusBox(index + digits.length)
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (value[index]) {
        setDigit(index, ' ')
      } else {
        setDigit(index - 1, ' ')
        focusBox(index - 1)
      }
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusBox(index - 1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusBox(index + 1)
    }
  }

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    handleChange(index, event.clipboardData.getData('text'))
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn('flex items-center gap-sm', className)}
    >
      {Array.from({ length }, (_, index) => {
        const digit = value[index]?.trim() ?? ''
        return (
          <input
            key={`${groupId}-${index}`}
            ref={(node) => {
              inputs.current[index] = node
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-label={`${ariaLabel} digit ${index + 1}`}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            className={cn(
              'h-otp-h w-otp-w rounded-input bg-surface-default text-center',
              'text-[22px] font-bold text-ink-primary',
              'transition-colors duration-fast ease-standard',
              'border border-border-default',
              digit && 'border-[1.5px] border-border-brand',
              'focus:border-[1.5px] focus:border-border-focus focus:outline-none',
              invalid && 'border-[1.5px] border-border-danger bg-state-danger-tint',
              'disabled:cursor-not-allowed disabled:bg-bg-skeleton disabled:text-ink-disabled',
            )}
          />
        )
      })}
    </div>
  )
}
