import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `NavItem` — component set 207:2926, with variants State=Default `207:2927`,
 * State=Active `207:2929` and State=Section `207:2931`. The header's nav entry.
 *
 * All three states are 15px/600 and differ only in colour, plus a rule on one of them:
 *
 * - Default — `--ink-primary`, no rule.
 * - Active — `--ink-brand-mid` with a 2px bottom rule and 4px of padding beneath the
 *   label. Figma records this as the state the five listing pages use on their own item.
 * - Section — `--brand-primary`, no rule. The four detail pages use it on their parent
 *   section's item, and Figma notes all four agree, so this is a real third state rather
 *   than an upstream inconsistency.
 *
 * Three points where the description and the drawing part company:
 *
 * - The description calls the rule a "brand/primary" rule. The export binds its colour to
 *   `--border-focus`. Both tokens resolve to `#F25F2C`, so nothing moves on screen, but
 *   the export's binding is the one implemented — which matters because `--brand-primary`
 *   is also in this component, carrying the Section state's text, so the two tokens do
 *   distinct jobs a few lines apart.
 * - The export binds the rule's 2px width to `size/focus-ring`. This project keeps the
 *   `--size-*` group out of the Tailwind utility namespace on purpose (see the note in
 *   `theme.css`) and writes stroke widths as literals, as `Button` does with its 1.5px
 *   border, so `border-b-2` is used. Worth recording that `Tabs` draws the same 2px rule
 *   and leaves it an unbound literal in its own export.
 * - The 4px padding is a bare literal in the export even though `--space-xs` is also 4px,
 *   so it stays a literal rather than being upgraded to a token it was never bound to.
 *
 * **Not built:** hover and disabled. Figma calls the three states verbatim and complete,
 * and there is a specific reason not to guess here: the states are distinguished by
 * colour alone along one brand ramp (`#191008` → `#D8431A` → `#F25F2C`), so any hover
 * colour would read as one of the other two states. The affordance is left to the cursor
 * and to the global `:focus-visible` outline in `src/styles/globals.css`.
 *
 * **Deliberate additions.** Figma draws a text node; this renders an anchor, because a
 * header nav item that does not navigate is not one, and Figma's own description
 * describes it in terms of which pages link where. `aria-current` is the accessibility
 * addition: `page` for Active, and `location` for Section, which is the value that says
 * "you are somewhere inside this" rather than "this is the page you are on".
 */
export interface NavItemProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  label: ReactNode
  /**
   * `active` is the listing page's own item; `section` is a detail page marking the
   * section it belongs to.
   */
  state?: 'default' | 'active' | 'section'
}

export function NavItem({ label, state = 'default', className, ...props }: NavItemProps) {
  return (
    <a
      aria-current={state === 'active' ? 'page' : state === 'section' ? 'location' : undefined}
      className={cn(
        'inline-flex items-center text-[15px] leading-[normal] font-semibold whitespace-nowrap',
        state === 'default' && 'text-ink-primary',
        state === 'active' && 'border-b-2 border-border-focus pb-[4px] text-ink-brand-mid',
        state === 'section' && 'text-brand-primary',
        className,
      )}
      {...props}
    >
      {label}
    </a>
  )
}
