import type { LabelHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * The small text parts of a form field, plus a `Field` wrapper that owns the
 * gaps between them.
 *
 * Figma models the label, error and counter as standalone hugging components and
 * says so explicitly: FieldLabel's 7px bottom margin, InlineError's 6px top
 * margin, and CharacterCounter's right alignment all "belong to the parent
 * stack". `Field` is that parent stack, so the spacing lives in one place
 * instead of being re-derived at every call site.
 */

/** Figma `FieldLabel` — node 207:1702. Label/Field, 13/600. */
export function FieldLabel({
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('text-label-field text-ink-primary', className)} {...props}>
      {children}
    </label>
  )
}

/** Figma `InlineError` — node 207:1704. Label/Error, 12.5/600. Shown on blur. */
export function InlineError({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      role="alert"
      className={cn('text-label-error text-state-danger', className)}
      {...props}
    >
      {children}
    </p>
  )
}

/**
 * Figma `CharacterCounter` — node 207:1706. 12px in `--ink-muted`.
 *
 * 12px is set directly and matches no named text style; the weight is
 * unspecified in the source, so it takes the body weight of 500.
 */
export function CharacterCounter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-[12px] font-medium text-ink-muted', className)}
      aria-live="polite"
      {...props}
    >
      {children}
    </p>
  )
}

export interface FieldProps {
  label?: ReactNode
  /** Rendered opposite the label, as Sign In does with "Forgot password". */
  labelAction?: ReactNode
  error?: ReactNode
  counter?: ReactNode
  htmlFor?: string
  className?: string
  children: ReactNode
}

export function Field({
  label,
  labelAction,
  error,
  counter,
  htmlFor,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {(label || labelAction) && (
        <div className="mb-[7px] flex items-center justify-between">
          {label && <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>}
          {labelAction}
        </div>
      )}
      {children}
      {error && <InlineError className="mt-[6px]">{error}</InlineError>}
      {counter && (
        <CharacterCounter className="mt-[6px] text-right">{counter}</CharacterCounter>
      )}
    </div>
  )
}
