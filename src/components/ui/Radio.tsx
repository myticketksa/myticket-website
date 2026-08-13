import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `Radio` — node 207:1727. Same row geometry as Checkbox: 16px control,
 * gap 10, 14px label.
 *
 * Checked is a **solid brand disc**, not a ring with an inner dot. Figma's
 * description calls this out specifically, since the native radio's inner dot is
 * browser-drawn and was never specified — so no ring is invented here.
 */
export const RadioGroup = RadioGroupPrimitive.Root

export interface RadioProps extends RadioGroupPrimitive.RadioGroupItemProps {
  label?: ReactNode
}

export function Radio({ className, label, id, ...props }: RadioProps) {
  const control = (
    <RadioGroupPrimitive.Item
      id={id}
      className={cn(
        'size-4 shrink-0 rounded-pill border border-border-default bg-surface-default',
        'transition-colors duration-fast ease-standard',
        'data-[state=checked]:border-brand-primary data-[state=checked]:bg-brand-primary',
        'disabled:cursor-not-allowed disabled:bg-bg-skeleton',
        !label && className,
      )}
      {...props}
    />
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
