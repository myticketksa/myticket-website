import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `LanguagePill` — node 207:1793. The header's language switch.
 *
 * h32, padding `0 12`, **1.5px** `--border-default`, 12px/700, `--ink-secondary`.
 * **Fill is unset** — the source declares no background, so it stays transparent and
 * picks up whatever it sits on.
 *
 * Radius is bound to `--radius-pill` (999), not the literal 16 the drawing reports:
 * Figma's shape rule is radius = height/2 and lists 32 → 16 explicitly, so 999
 * renders identically while surviving a resize.
 *
 * The Arabic label needs `--font-arabic` (Cairo, which is what Figma resolves to
 * here). Figma's own note warns the label would show tofu because IBM Plex Sans
 * Arabic is not installed in the file; Cairo is loaded in this project, so the glyphs
 * render. The label is a language name, so it keeps its own `lang` and `dir`
 * regardless of the surrounding document direction.
 *
 * No hover or active state is drawn. Since this is a control, the border moving to
 * `--border-focus` on hover is a deliberate addition.
 */
export interface LanguagePillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** BCP-47 tag for the language being offered, e.g. `ar`. */
  lang?: string
  children: ReactNode
}

export function LanguagePill({
  className,
  lang = 'ar',
  children,
  ...props
}: LanguagePillProps) {
  return (
    <button
      type="button"
      lang={lang}
      dir="auto"
      className={cn(
        'inline-flex h-[32px] items-center justify-center rounded-pill px-md',
        'border-[1.5px] border-border-default text-[12px] font-bold text-ink-secondary',
        'font-arabic transition-colors duration-normal ease-standard hover:border-border-focus',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
