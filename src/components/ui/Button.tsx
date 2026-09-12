import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'

/**
 * Figma `Button` — node 207:1630. See docs/figma-artifacts/Button.md.
 *
 * Radius is height/2 at every size, so the shape is a true pill and each size
 * gets its own radius token rather than sharing `--radius-control`.
 *
 * Primary / cardCta use a solid overlay that fades in on hover so the
 * gradient→flat brand settle is smooth (CSS cannot interpolate gradient→solid).
 */
const button = cva(
  [
    'relative inline-flex items-center justify-center gap-control-gap overflow-hidden whitespace-nowrap',
    'transition-[color,border-color,background-color,transform,box-shadow] duration-normal ease-standard',
    'active:scale-[0.97] active:duration-100',
    'disabled:cursor-not-allowed disabled:active:scale-100',
    'motion-reduce:active:scale-100',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-brand-gradient text-ink-inverse',
          'before:pointer-events-none before:absolute before:inset-0 before:bg-brand-primary',
          'before:opacity-0 before:transition-opacity before:duration-normal before:ease-standard',
          'hover:before:opacity-100',
        ].join(' '),
        secondary:
          'border-[1.5px] border-border-default bg-surface-default text-ink-primary hover:border-border-brand hover:text-ink-brand',
        ghost:
          'text-ink-secondary hover:bg-[color-mix(in_srgb,var(--color-brand-primary)_6%,transparent)] hover:text-ink-brand',
        destructive:
          'border border-border-danger bg-surface-default text-state-danger hover:bg-state-danger-tint',
        icon: [
          'border-[1.5px] border-border-default bg-surface-default text-ink-primary',
          'hover:border-border-brand hover:scale-105 active:scale-[0.93]',
          'motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
        ].join(' '),
        cardCta: [
          'bg-brand-gradient-compact text-ink-inverse',
          'before:pointer-events-none before:absolute before:inset-0 before:bg-brand-primary',
          'before:opacity-0 before:transition-opacity before:duration-normal before:ease-standard',
          'hover:before:opacity-100',
        ].join(' '),
      },
      size: {
        lg: 'h-btn-lg rounded-btn-lg px-btn-pad-lg text-[15px]',
        md: 'h-btn-md rounded-btn-md px-btn-pad-md text-[14px]',
        sm: 'h-btn-sm rounded-btn-sm px-btn-pad-sm text-[13px]',
      },
    },
    compoundVariants: [
      { size: 'lg', class: 'font-bold' },
      { size: 'md', class: 'font-semibold' },
      { size: 'sm', class: 'font-semibold' },
      { variant: 'cardCta', size: 'sm', class: 'px-lg' },
      { variant: 'icon', size: 'lg', class: 'aspect-square w-btn-lg !px-0' },
      { variant: 'icon', size: 'md', class: 'aspect-square w-btn-md !px-0' },
      { variant: 'icon', size: 'sm', class: 'aspect-square w-btn-sm !px-0' },
    ],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof button> {
  children?: ReactNode
  /** Leading icon. Drawn at 18px in the design; pass the icon already sized. */
  icon?: ReactNode
  /** Swaps the leading icon for a spinner and blocks interaction. */
  loading?: boolean
}

export function Button({
  className,
  variant,
  size,
  children,
  icon,
  loading = false,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        button({ variant, size }),
        loading && 'opacity-75',
        disabled &&
          !loading &&
          'border-transparent bg-bg-skeleton bg-none text-ink-disabled before:hidden hover:bg-bg-skeleton hover:text-ink-disabled',
        className,
      )}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-control-gap">
        {loading ? (
          <span className="inline-flex animate-[spinner-fade_150ms_var(--ease-micro)_both]">
            <Spinner size={14} />
          </span>
        ) : (
          icon
        )}
        {children}
      </span>
    </button>
  )
}
