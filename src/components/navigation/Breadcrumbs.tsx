import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `Breadcrumbs` — node 207:2835. A single flat flex row: five text nodes with an
 * 8px gap (`--space-sm`) between every one of them, all set in `Body/Caption` — 13px,
 * weight 500, line-height 1.5, no tracking. Figma attaches that named text style to the
 * row itself rather than to the individual nodes, so `text-body-caption` is a genuine
 * reuse here and not a literal that happens to match.
 *
 * The ancestors and the `/` separators are all `--ink-muted`; only the last item is
 * `--ink-primary`, and it stays at weight 500 like everything else, so the current page
 * is distinguished by colour alone. The separators are literal `/` characters in the
 * source, not a glyph and not a border, so they stay as text.
 *
 * The source draws three levels (Home / Events / Winter Nights) and Figma notes that
 * deeper trails simply add another ancestor and separator pair. That is why the API is a
 * list rather than the three fixed slots Figma's own export generates: the drawing is one
 * instance of a repeating pattern, not a three-level ceiling. The separator is emitted
 * before every item except the first, which reproduces the drawn order exactly.
 *
 * There is no description-versus-drawing conflict on this component; the two agree on
 * every measurement and colour.
 *
 * **Not built:** any hover, focus or link colour for the ancestors. Figma draws them as
 * plain spans and states that no such colour is specified and none was invented, so
 * there is none here either — an ancestor rendered as a link keeps exactly the
 * `--ink-muted` it is drawn in, and its focus ring comes from the global
 * `:focus-visible` rule in `src/styles/globals.css`.
 *
 * **Deliberate additions, all accessibility.** The `nav` landmark with an accessible
 * name, the `ol`/`li` structure so the trail is announced as an ordered list with a
 * length, `aria-current="page"` on the last item, and `aria-hidden` on the separators so
 * they are not read out as content. None of these can be expressed in Figma. The
 * optional `href` per item is also an addition: Figma draws static text, but a breadcrumb
 * that cannot be clicked is not a breadcrumb, so an item with an `href` renders as an
 * anchor with identical paint and an item without one stays a span.
 *
 * Width is not set. The drawn row is content-width and the page decides where it sits.
 */
export interface BreadcrumbItem {
  label: ReactNode
  /** Renders the item as an anchor. Omit it to keep the plain span Figma draws. */
  href?: string
}

export interface BreadcrumbsProps {
  /** Root first, current page last. The last item is the one painted `--ink-primary`. */
  items: BreadcrumbItem[]
  /** The landmark's accessible name, in case a page carries more than one trail. */
  label?: string
  className?: string
}

export function Breadcrumbs({ items, label = 'Breadcrumb', className }: BreadcrumbsProps) {
  return (
    <nav aria-label={label} className={cn('text-body-caption', className)}>
      <ol className="flex items-center gap-sm whitespace-nowrap">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-sm">
              {index > 0 && (
                <span aria-hidden="true" className="text-ink-muted">
                  /
                </span>
              )}

              {item.href && !isCurrent ? (
                <a href={item.href} className="text-ink-muted">
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={isCurrent ? 'page' : undefined}
                  className={isCurrent ? 'text-ink-primary' : 'text-ink-muted'}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
