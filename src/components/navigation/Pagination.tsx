import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `Pagination` — node 207:2852. **There is no numbered pager in this design
 * system.** Figma states the rule as *"load more preferred"*, and what is drawn is a
 * single load-more button with a running count beside it, so that is the whole component:
 * no page numbers, no first/last arrows, no ellipsis.
 *
 * The row is `flex`, vertically centred, with a 10px gap (`--space-row-gap`). The counter
 * is 12.5px/500 in `--ink-muted`.
 *
 * The button is deliberately off the button scale, and Figma spells out why: the `Button`
 * set carries only the 48/42/36 web sizes, so instancing it here would have meant
 * overriding height, radius, padding and font size at once. It is a local frame at 40
 * high, `--space-xl` (20px) horizontal padding, a 1.5px `--border-default` stroke on
 * `--surface-default`, and 13.5px/600 in `--ink-primary`. The radius is bound to
 * `--radius-pill` (999) rather than to the 20 that height/2 would give, and since 999
 * renders identically on a 40px box the binding is kept as drawn. The height stays a
 * literal because the source records it as one.
 *
 * Description-versus-drawing notes, both minor and both resolved toward the drawing:
 * the description calls the stroke colour `border/base` while the export binds
 * `--border-default`, which is the name that exists in this file's token set; and the
 * description gives the radius as 20 before explaining that it is bound to
 * `radius/pill`, so `rounded-pill` is what ships.
 *
 * **Not built:** an exhausted or disabled treatment for the button. None is drawn, and a
 * button that is dimmed by a paint nobody specified would be invention, so the page
 * should stop rendering the button once there is nothing left to load. Numbered pages
 * and end arrows are not built for the same reason — the source contains neither.
 *
 * **One deliberate addition to the paint.** The button's resting appearance is identical
 * to `Button` variant `secondary` in every measurement that carries a colour (1.5px
 * `--border-default`, `--surface-default`, `--ink-primary`), and that variant's hover
 * *is* drawn, so its hover is borrowed here rather than guessed: the border moves to
 * `--border-brand` and the label to `--ink-brand`. The transition uses the project's
 * motion tokens, which `theme.css` already records as an addition to Figma.
 *
 * **Accessibility additions.** The button is a real `button`; the counter is
 * `aria-live="polite"` so the new total is announced after a click, and it is wired to
 * the button with `aria-describedby` so the button reads as "Show 24 more, Showing 24 of
 * 168" rather than as a bare label. Width is not set — the row hugs its content and the
 * page places it.
 */
export interface PaginationProps {
  /** The button label. Figma draws the remaining count inside it, e.g. "Show 24 more". */
  label: ReactNode
  /** The running total beside the button, e.g. "Showing 24 of 168". */
  counter: ReactNode
  onLoadMore?: () => void
  className?: string
}

export function Pagination({ label, counter, onLoadMore, className }: PaginationProps) {
  const counterId = useId()

  return (
    <div className={cn('flex items-center gap-row-gap', className)}>
      <button
        type="button"
        onClick={onLoadMore}
        aria-describedby={counterId}
        className={cn(
          'flex h-[40px] shrink-0 items-center justify-center overflow-clip rounded-pill px-xl',
          'border-[1.5px] border-border-default bg-surface-default',
          'text-[13.5px] leading-[normal] font-semibold whitespace-nowrap text-ink-primary',
          'transition-colors duration-normal ease-standard hover:border-border-brand hover:text-ink-brand',
        )}
      >
        {label}
      </button>

      <p
        id={counterId}
        aria-live="polite"
        className="shrink-0 text-[12.5px] leading-[normal] font-medium whitespace-nowrap text-ink-muted"
      >
        {counter}
      </p>
    </div>
  )
}
