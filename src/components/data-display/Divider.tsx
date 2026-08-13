import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `Divider` — node 207:1812. **Both tones are 1px.**
 *
 * `divider` (`--border-divider`) is for hairlines *inside* cards and tables:
 * spec-table rows, the tabs baseline, the money-total rule.
 * `border` (`--border-default`) is for edges *between* things: around cards,
 * between panels, the header and footer edges.
 *
 * There is no 1.5px divider anywhere. The 1.5px weight in the foundations is a
 * *control* border — secondary buttons, the search pill, icon buttons — so it is
 * not a tone here.
 */
export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'divider' | 'border'
  orientation?: 'horizontal' | 'vertical'
}

export function Divider({
  className,
  tone = 'divider',
  orientation = 'horizontal',
  ...props
}: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        tone === 'divider' ? 'bg-border-divider' : 'bg-border-default',
        className,
      )}
      {...props}
    />
  )
}
