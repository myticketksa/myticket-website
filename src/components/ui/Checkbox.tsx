import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { CheckIcon } from '@/components/icons'
import { easeMicro, motionTokens } from '@/lib/motion'

/**
 * Figma `Checkbox` — node 207:1717.
 *
 * The box is 16x16 with **square corners**. Checked indicator scales in per guest motion.
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
  const reduce = useReducedMotion()

  const control = (
    <CheckboxPrimitive.Root
      id={id}
      className={cn(
        'flex size-4 shrink-0 items-center justify-center border border-border-default bg-surface-default',
        'transition-colors duration-micro ease-micro',
        'data-[state=checked]:border-brand-primary data-[state=checked]:bg-brand-primary',
        'disabled:cursor-not-allowed disabled:bg-bg-skeleton',
        !label && className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator asChild forceMount={false}>
        <motion.span
          className="flex items-center justify-center text-ink-inverse"
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: motionTokens.micro.duration, ease: easeMicro }
          }
        >
          <CheckIcon size={12} />
        </motion.span>
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
