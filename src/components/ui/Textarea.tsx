import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { fieldError } from './TextInput'

/**
 * Figma `Textarea` — node 207:1700. min-height 92, padding 12/14, radius 12.
 *
 * Note the type is 14px/1.5 (Body/Small), a step down from TextInput's 15px/1.55
 * (Body/Default). The counter is deliberately not composed in — Figma's
 * description says to build it as a sibling, which `Field` does.
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(
        'min-h-[92px] w-full rounded-input bg-surface-default px-field-pad py-md',
        'border border-border-default text-[14px] leading-[1.5] text-ink-primary',
        'transition-colors duration-normal ease-standard placeholder:text-ink-muted',
        'focus:border-[1.5px] focus:border-border-focus focus:outline-none',
        'disabled:cursor-not-allowed disabled:bg-bg-skeleton disabled:text-ink-disabled',
        invalid && fieldError,
        className,
      )}
      {...props}
    />
  )
}
