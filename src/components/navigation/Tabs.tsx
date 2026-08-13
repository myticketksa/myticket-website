import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `Tabs` — component set 207:2841, with variants State=Active `207:2842` and
 * State=Default `207:2847`. Figma calls it *"Tab ITEM"* in its own description, so the
 * component is one tab and not the bar, and the export is named `Tab` accordingly.
 *
 * The label is 14.5px/600 sitting `--space-control-gap` (9px) above a full-width 2px
 * underline. Active paints the label `--ink-brand-mid` and the underline
 * `--border-focus`; Default paints the label `--ink-secondary` and leaves the underline
 * node present but unpainted, which is what keeps the two variants the same height —
 * hiding it would lose 2px and shift the row. The count suffix is 12px at 70% opacity
 * and inherits whatever colour the tab is in, so it is never given a colour of its own.
 *
 * Three places where the written description and the drawing disagree, and the drawing
 * wins in all three:
 *
 * - The description specifies `padding-bottom: 9` on the label. The drawing is a
 *   two-child column with a 9px gap, which renders identically and is the thing that is
 *   actually bound to `space/control-gap`, so the gap is what is built.
 * - The description says the underline height is bound to `size/focus-ring`. The export
 *   writes it as the bare literal `2px`, so it stays a literal here. This is a real
 *   inconsistency inside the file rather than a rounding difference: `NavItem` draws the
 *   same 2px rule and *does* bind it to `size/focus-ring`.
 * - The description says the source separates label and count with a literal space
 *   inside one inline text flow. The drawing is two text nodes with a 4px gap on a
 *   shared baseline, which is also the only version that can carry the count's separate
 *   size and opacity, so that is what is built.
 *
 * **Not built:** the tab bar itself — the drawn 22px gap between tabs and the 1px
 * `#F7E9E1` rail behind them. Figma assigns both to the container, so they belong to the
 * page that lays the tabs out, and `TabList` deliberately draws neither. Hover and
 * disabled are not built either; Figma states outright that neither is specified and
 * that neither was invented, so no colour was guessed for them here.
 *
 * **Deliberate additions, both accessibility only.** `role="tab"` with `aria-selected`
 * cannot be expressed in Figma but is what makes a tab a tab to a screen reader, and
 * `role="tab"` is invalid without a `role="tablist"` parent — hence `TabList`, which
 * supplies that role and nothing else. Focus visibility comes from the global
 * `:focus-visible` outline in `src/styles/globals.css`, so none is added locally.
 */
export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: ReactNode
  /** The count suffix, e.g. `8`. Drawn at 12px and 70% opacity in the tab's own colour. */
  count?: ReactNode
  /** Paints the label `--ink-brand-mid` and the underline `--border-focus`. */
  active?: boolean
}

export function Tab({ label, count, active = false, className, ...props }: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn('inline-flex flex-col items-start gap-control-gap', className)}
      {...props}
    >
      <span
        className={cn(
          'flex items-baseline gap-xs overflow-clip text-[14.5px] leading-[normal] font-semibold whitespace-nowrap',
          active ? 'text-ink-brand-mid' : 'text-ink-secondary',
        )}
      >
        {label}
        {count !== undefined && <span className="text-[12px] opacity-70">{count}</span>}
      </span>

      <span
        aria-hidden="true"
        className={cn('h-[2px] w-full', active && 'bg-border-focus')}
      />
    </button>
  )
}

/**
 * The `role="tablist"` parent that `Tab` requires, carrying no paint of its own.
 *
 * Figma's tab bar is explicitly out of scope for the component — the 22px gap and the
 * 1px `#F7E9E1` rail belong to the container — so this applies neither. Pass the layout
 * in through `className` and give it an `aria-label` describing what the tabs switch
 * between.
 */
export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function TabList({ children, ...props }: TabListProps) {
  return (
    <div role="tablist" {...props}>
      {children}
    </div>
  )
}
