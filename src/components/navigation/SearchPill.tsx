import type { InputHTMLAttributes } from 'react'
import { MagnifyingGlassIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

/**
 * Figma `SearchPill` — node 207:2933. The header's search entry point.
 *
 * h44 (`--size-search`), radius 22 (`--radius-search`), padding `0 16`, gap 9
 * (`--space-control-gap`), 1.5px `--border-default` on white. The glyph is 15px in
 * `--brand-primary`; the placeholder is 14px/500 `--ink-muted`.
 *
 * **It overlaps `SearchField` size=field deliberately.** Figma's note: same paint and
 * metrics, but `SearchField` is a *fixed* 240 wide, and this one exists to be set to
 * fill between a 200 minimum and a 300 maximum — which a fixed-width component cannot
 * express. That is the whole reason both exist, so the width behaviour lives here and
 * the standalone 300 is the source's maximum, not a token. Figma leaves the question of
 * folding one into the other open; both are kept until a page forces the decision.
 *
 * Figma's description calls the glyph the literal ⌕ (U+2315) rather than an icon. The
 * drawing contains a vector, and downloading it identifies Phosphor `MagnifyingGlass`
 * filled `#F25F2C`. The drawing wins. Note this is *not* the custom `SearchIcon` — the
 * same split between the documented custom set and the Phosphor glyphs the real pages
 * draw shows up here as it does on the cards.
 *
 * Rendered as a real `input` rather than the static text the source draws, since the
 * source says it links to Search Results and a placeholder that cannot be typed into
 * would be a dead control.
 */
export interface SearchPillProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export function SearchPill({
  className,
  placeholder = 'Search events, artists…',
  ...props
}: SearchPillProps) {
  return (
    <div
      className={cn(
        'flex h-search items-center gap-control-gap rounded-search border-[1.5px] border-border-default',
        'bg-surface-default px-lg transition-colors duration-normal ease-standard',
        'focus-within:border-border-focus',
        className,
      )}
    >
      <MagnifyingGlassIcon size={15} className="shrink-0 text-brand-primary" />
      <input
        type="search"
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[14px] leading-[1.5] font-medium text-ink-primary outline-none placeholder:text-ink-muted"
        {...props}
      />
    </div>
  )
}
