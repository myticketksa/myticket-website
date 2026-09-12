import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { easeMicro, motionTokens } from '@/lib/motion'

/**
 * Figma `Radio` — node 207:1727. Same row geometry as Checkbox: 16px control,
 * gap 10, 14px label.
 *
 * Checked is a **solid brand disc**, not a ring with an inner dot. Disc scales in
 * on check per guest motion language.
 */
export const RadioGroup = RadioGroupPrimitive.Root

export interface RadioProps extends RadioGroupPrimitive.RadioGroupItemProps {
  label?: ReactNode
}

export function Radio({ className, label, id, ...props }: RadioProps) {
  const reduce = useReducedMotion()

  const control = (
    <RadioGroupPrimitive.Item
      id={id}
      className={cn(
        'relative size-4 shrink-0 rounded-pill border border-border-default bg-surface-default',
        'transition-colors duration-micro ease-micro',
        'data-[state=checked]:border-brand-primary',
        'disabled:cursor-not-allowed disabled:bg-bg-skeleton',
        !label && className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator asChild>
        <motion.span
          className="absolute inset-0 rounded-pill bg-brand-primary"
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: motionTokens.micro.duration, ease: easeMicro }
          }
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )

  if (!label) return control

  return (
    <div className={cn('flex items-center gap-row-gap', className)}>
      {control}
      <label htmlFor={id} className="text-[14px] leading-[1.5] text-ink-primary">
        {label}
      </label>
    </div>
  )
}
