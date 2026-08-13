import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'

/**
 * Figma `Button` — node 207:1630. See docs/figma-artifacts/Button.md.
 *
 * Radius is height/2 at every size, so the shape is a true pill and each size
 * gets its own radius token rather than sharing `--radius-control`.
 */
const button = cva(
  'inline-flex items-center justify-center gap-control-gap whitespace-nowrap transition-colors duration-normal ease-standard disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // The gradient collapses to a flat brand fill on hover. That is the
        // design, not a shortcut.
        primary:
          'bg-brand-gradient text-ink-inverse hover:bg-none hover:bg-brand-primary',
        secondary:
          'border-[1.5px] border-border-default bg-surface-default text-ink-primary hover:border-border-brand hover:text-ink-brand',
        ghost: 'text-ink-secondary hover:text-ink-brand',
        // Destructive is the one style drawn with a 1px border instead of 1.5px.
        destructive:
          'border border-border-danger bg-surface-default text-state-danger hover:bg-state-danger-tint',
        icon: 'border-[1.5px] border-border-default bg-surface-default text-ink-primary hover:border-border-brand',
        // Figma `Button — State-card CTA` (207:1687). Carries the two-stop
        // gradient/cta-compact rather than the three-stop ramp, which Figma keeps
        // "distinct" deliberately. Only valid at size sm, where it also takes 16px
        // padding instead of the 15px the standard S button uses.
        cardCta: 'bg-brand-gradient-compact text-ink-inverse hover:bg-none hover:bg-brand-primary',
      },
      size: {
        lg: 'h-btn-lg rounded-btn-lg px-btn-pad-lg text-[15px]',
        md: 'h-btn-md rounded-btn-md px-btn-pad-md text-[14px]',
        sm: 'h-btn-sm rounded-btn-sm px-btn-pad-sm text-[13px]',
      },
    },
    compoundVariants: [
      // Size L is the only size set in Bold; M and S are SemiBold.
      { size: 'lg', class: 'font-bold' },
      { size: 'md', class: 'font-semibold' },
      { size: 'sm', class: 'font-semibold' },
      { variant: 'cardCta', size: 'sm', class: 'px-lg' },
      // Icon buttons are square, so the horizontal padding is dropped.
      { variant: 'icon', size: 'lg', class: 'w-btn-lg px-0' },
      { variant: 'icon', size: 'md', class: 'w-btn-md px-0' },
      { variant: 'icon', size: 'sm', class: 'w-btn-sm px-0' },
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
        // Disabled and Loading are drawn at Primary M only, but both read as
        // state layers over whatever style they land on.
        loading && 'opacity-75',
        disabled &&
          !loading &&
          'border-transparent bg-bg-skeleton bg-none text-ink-disabled hover:bg-bg-skeleton hover:text-ink-disabled',
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size={14} /> : icon}
      {children}
    </button>
  )
}
