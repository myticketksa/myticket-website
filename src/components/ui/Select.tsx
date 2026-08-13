import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { fieldError } from './TextInput'

/**
 * Figma `Select` — node 207:1698. The same box as TextInput — h48, px14,
 * radius 12, 1px border — with the text in `--ink-primary` because it shows a
 * chosen value rather than a placeholder.
 *
 * **No chevron.** The source draws none and Figma's description confirms the
 * omission is deliberate, so none is added. `appearance-none` suppresses the
 * browser's own arrow, which would otherwise reintroduce it.
 */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export function Select({ className, invalid, children, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(
        'h-input w-full appearance-none rounded-input bg-surface-default px-field-pad',
        'border border-border-default text-[15px] leading-[1.55] text-ink-primary',
        'transition-colors duration-normal ease-standard',
        'focus:border-[1.5px] focus:border-border-focus focus:outline-none',
        'disabled:cursor-not-allowed disabled:bg-bg-skeleton disabled:text-ink-disabled',
        invalid && fieldError,
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
