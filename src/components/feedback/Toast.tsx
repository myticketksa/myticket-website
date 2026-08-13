import type { ReactNode } from 'react'
import { CheckIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

/**
 * Figma `Toast` — node 207:2875, with variants Success `207:2876`, Error `207:2883`
 * and Neutral `207:2890`.
 *
 * One shell carries all three tones: `flex`, centre-aligned, 12px gap, 16 radius,
 * 14×18 padding, a 1px border, a `flex-1` body column and the action last. Nothing
 * about the geometry changes between tones — only the paint, the leading glyph and
 * two type colours — so `tone` is the variant axis.
 *
 * | | Success | Error | Neutral |
 * | --- | --- | --- | --- |
 * | ground | `--surface-inverse` | `--state-danger-tint` | `--surface-default` |
 * | border | `--border-default` | `--state-danger-border` | `--border-default` |
 * | body ink | `--bg-page` | title `--state-danger-deep`, subtitle `--ink-secondary` | title `--ink-primary`, subtitle `--ink-secondary` |
 * | subtitle | 75% opacity | full opacity | full opacity |
 * | badge | 22×22 r11 `--state-success` | 22×22 r11 `--state-danger` | none |
 * | action | `--brand-gradient-start` | `--state-danger` | `--ink-brand` |
 *
 * Type is 14px/700 for the title, 12.5px/500 for the subtitle and 13px/700 for the
 * action, at the browser's `normal` line height in every tone. The 16 radius and the
 * 14×18 padding are bare literals in the export, not token bindings, so they are
 * written out rather than mapped onto `--radius-card` (18) or the spacing scale.
 *
 * **The success tick is a vector, not a character.** Figma's description states that
 * "the ✓ and ! are literal text glyphs (A3c), not icons", and for the `!` that is
 * true — it is a real text node at 12px/800 bound to `--ink-inverse`. The ✓ is not:
 * the export ships it as an SVG asset named `icon/check@12`, and downloading it shows
 * a `<g id="glyph">` wrapper around Phosphor's `Check` at regular weight, scaled into
 * a 12px box. The drawing wins, so this is `CheckIcon` at 12px. The asset bakes
 * `fill="white"` rather than binding a variable; `--ink-inverse` is used because the
 * sibling `!` glyph in the Error tone is bound to exactly that token for the same job.
 *
 * The Neutral tone is drawn in the file as a real variant, so it is built, but Figma
 * records that it was *derived* rather than sourced — M6 states "no info / warning
 * toast variant is drawn" — and that its copy is a marked placeholder. It therefore
 * carries no badge, because inventing a third glyph would be fabrication, and callers
 * should treat it as provisional.
 *
 * **Not built:** a dismiss (×) affordance, because none is drawn. The two documented
 * behaviours that are not geometry — "toasts bottom-left, self-dismissing at 5s" and
 * a 14px gap between stacked toasts — belong to a toast viewport that this node does
 * not describe, so they are recorded here rather than built into the shell.
 *
 * Deliberate additions: the drawn 380px width is applied as a **max**-width, because a
 * toast that cannot narrow will overflow a phone viewport and nothing in the source
 * asks for a rigid frame; the action is promoted from a text node to a real `button`
 * because it is an interactive affordance, with no padding, border or ground added so
 * it still renders exactly as drawn; and the shell announces itself to assistive
 * technology — `role="alert"` for Error, `role="status"` for the other two — since
 * Figma cannot express live-region semantics.
 */
type ToneRecipe = {
  shell: string
  badge?: string
  body: string
  title: string
  subtitle: string
  action: string
}

const TONES: Record<'success' | 'error' | 'neutral', ToneRecipe> = {
  success: {
    shell: 'border-border-default bg-surface-inverse',
    badge: 'bg-state-success',
    body: 'text-bg-page',
    title: '',
    subtitle: 'opacity-75',
    action: 'text-brand-gradient-start',
  },
  error: {
    shell: 'border-state-danger-border bg-state-danger-tint',
    badge: 'bg-state-danger',
    body: '',
    title: 'text-state-danger-deep',
    subtitle: 'text-ink-secondary',
    action: 'text-state-danger',
  },
  neutral: {
    shell: 'border-border-default bg-surface-default',
    body: '',
    title: 'text-ink-primary',
    subtitle: 'text-ink-secondary',
    action: 'text-ink-brand',
  },
}

export interface ToastProps {
  title: ReactNode
  subtitle: ReactNode
  /**
   * Success is drawn on near-black, Error on the danger tint. Neutral exists but is
   * derived rather than drawn — see the note above before reaching for it.
   */
  tone?: 'success' | 'error' | 'neutral'
  /** The trailing text action, e.g. "View" or "Retry". Omit it and the slot collapses. */
  action?: ReactNode
  onAction?: () => void
  className?: string
}

export function Toast({
  title,
  subtitle,
  tone = 'success',
  action,
  onAction,
  className,
}: ToastProps) {
  const recipe = TONES[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex w-full max-w-[380px] items-center gap-md rounded-[16px] border px-[18px] py-[14px]',
        recipe.shell,
        className,
      )}
    >
      {recipe.badge && (
        <div
          className={cn(
            'flex size-[22px] shrink-0 items-center justify-center overflow-clip rounded-[11px]',
            recipe.badge,
          )}
        >
          {tone === 'success' ? (
            <CheckIcon size={12} className="text-ink-inverse" />
          ) : (
            <span className="text-[12px] font-extrabold text-ink-inverse">!</span>
          )}
        </div>
      )}

      <div className={cn('flex min-w-0 flex-1 flex-col items-start overflow-clip', recipe.body)}>
        <p className={cn('w-full text-[14px] font-bold', recipe.title)}>{title}</p>
        <p className={cn('w-full text-[12.5px] font-medium', recipe.subtitle)}>{subtitle}</p>
      </div>

      {action && (
        <button
          type="button"
          onClick={onAction}
          className={cn('shrink-0 text-[13px] font-bold whitespace-nowrap', recipe.action)}
        >
          {action}
        </button>
      )}
    </div>
  )
}
