import * as SwitchPrimitive from '@radix-ui/react-switch'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `Toggle` — node 207:1734. Track 44x26, knob 20x20 inset 3, row gap 12.
 *
 * Two things the design fixes that are easy to get wrong:
 *
 * ON uses `--gradient-identity`, a two-stop ramp ending on `#e0451a`, **not**
 * the three-stop `--gradient-brand`. OFF fills the track with
 * `--border-default`, using a border colour as a fill.
 *
 * The label also changes colour with state: `--ink-primary` when on,
 * `--ink-secondary` when off.
 */
export interface ToggleProps extends Omit<SwitchPrimitive.SwitchProps, 'children'> {
  label?: ReactNode
}

export function Toggle({ className, label, id, checked, ...props }: ToggleProps) {
  const control = (
    <SwitchPrimitive.Root
      id={id}
      checked={checked}
      className={cn(
        'h-[26px] w-11 shrink-0 rounded-pill bg-border-default',
        'transition-colors duration-normal ease-standard',
        'data-[state=checked]:bg-identity-gradient',
        'disabled:cursor-not-allowed disabled:opacity-50',
        !label && className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'block size-toggle-knob rounded-pill bg-surface-default',
          'translate-x-[3px] transition-transform duration-normal ease-standard',
          'data-[state=checked]:translate-x-[21px]',
        )}
      />
    </SwitchPrimitive.Root>
  )

  if (!label) return control

  return (
    <div className={cn('flex items-center gap-md', className)}>
      {control}
      <label
        htmlFor={id}
        className={cn(
          'text-[14px] leading-[1.5]',
          checked ? 'text-ink-primary' : 'text-ink-secondary',
        )}
      >
        {label}
      </label>
    </div>
  )
}
