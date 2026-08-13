import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { CheckIcon } from '@/components/icons'

/**
 * Figma `Checkbox` — node 207:1717.
 *
 * The box is 16x16 with **square corners**. Figma's description is explicit that
 * the source uses a native input whose radius was never specified, so it is left
 * unset rather than rounded to `--radius-badge` on a guess.
 *
 * `count` is the trailing facet count used in filter panels. Figma notes the
 * source pushes it right with `margin-left: auto`, which only works on a
 * full-width row — hence `fullWidth`.
 */
export interface CheckboxProps
  extends Omit<CheckboxPrimitive.CheckboxProps, 'children'> {
  label?: ReactNode
  count?: ReactNode
  /** Pushes `count` to the far right. Needed when the row spans a filter column. */
  fullWidth?: boolean
}

export function Checkbox({
  className,
  label,
  count,
  fullWidth = false,
  id,
  ...props
}: CheckboxProps) {
  const control = (
    <CheckboxPrimitive.Root
      id={id}
      className={cn(
        'flex size-4 shrink-0 items-center justify-center border border-border-default bg-surface-default',
        'transition-colors duration-fast ease-standard',
        'data-[state=checked]:border-brand-primary data-[state=checked]:bg-brand-primary',
        'disabled:cursor-not-allowed disabled:bg-bg-skeleton',
        !label && className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="text-ink-inverse">
        <CheckIcon size={12} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (!label) return control

  return (
    <div
      className={cn('flex items-center gap-row-gap', fullWidth && 'w-full', className)}
    >
      {control}
      <label htmlFor={id} className="text-[14px] leading-[1.5] text-ink-body">
        {label}
      </label>
      {count !== undefined && (
        <span
          className={cn(
            'text-[13px] leading-[1.5] text-ink-muted',
            fullWidth && 'ml-auto',
          )}
        >
          {count}
        </span>
      )}
    </div>
  )
}
