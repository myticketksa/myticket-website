# Navigation & sections — Figma artifact

Source file `yffYsbbooJbCZMYbAWSMfH`. Built to `src/components/navigation/` and
`src/components/sections/`.

---

## Logo — `207:3096`

Bilingual lockup. Aspect 1.833:1 (73×40 in the nav, 80.3×44 in the footer). Shipped as a
PNG because that is what Figma exports; height is the only dimension exposed and width
follows from `aspect-[73/40]`.

## SearchPill — `207:2933`

h44, radius 22, padding `0 16`, gap 9, 1.5px border. Exists alongside `SearchField`
because this one flexes between min 200 and max 300; `SearchField` is fixed 240. Glyph is
Phosphor `MagnifyingGlass` at 15px in brand — Figma's description calls it a literal ⌕;
the drawing is a vector.

## NavItem — `207:2926`

15px/600 in three colour states: Default `--ink-primary`, Active `--ink-brand-mid` + 2px
`--border-focus` bottom rule with 4px padding, Section `--brand-primary`. No hover —
the three states already occupy the brand ramp, so any hover colour would read as another
state. Renders as an anchor with `aria-current`.

## SiteHeader — `207:2936`

80px shell, 1400/40 band, backdrop blur 7px (CSS half of Figma's 14 `--blur-header`).
All five nav items are real `NavItem` instances. Near-misses drawn locally: language pill
(h36/13px vs atom's h32/12px), count badge size override (17 vs 16). Avatar `md` (32px)
was added to the atom because the header contradicted the DS claim that no 32px exists.
Sign-in carries a 16px heart as drawn; `signInIcon` can turn it off if design agrees it is
a leftover.

## SiteFooter — `207:2977`

Full and Minimal. Grid `1.4fr 1fr 1fr 1fr 1fr` (Figma's pinned 300.74px brand column was a
workaround for auto-layout lacking fractional grow — CSS expresses the intent directly).
Minimal is bottom bar only, no shell top border.

## SectionHeader — `207:2818`

Overline / H2 Section / optional lede / plain-text "see more" link (14px/700, no pill —
Figma records a previous build getting this wrong three ways). Max-width 720 on the text
column. Hero variant not built.

## Tab / TabList — `207:2841`

Single tab item, not a bar. Label 14.5px/600, 9px gap, 2px underline. Count at 12px/70%.
`TabList` is a paint-free `role="tablist"` parent so it cannot become the unbuilt bar
(22px gap + divider rail belong to the page).

## Breadcrumbs — `207:2835`

`Body/Caption` row, 8px gaps, `/` separators. Last crumb `--ink-primary` with
`aria-current="page"`. List API rather than three fixed slots.

## Pagination — `207:2852`

**Not a numbered pager.** One "load more" button (h40, off the button scale by Figma's
own reasoning) plus a running counter. No arrows, no page numbers.

---

## System-wide fixes landed with this layer

- **Cursor:** Tailwind v4 preflight sets `cursor: default` on buttons. Restored
  `cursor: pointer` in `globals.css` for enabled buttons and `[role=button]`.
- **Stale shadcn traps deleted:** `dialog.tsx`, `tabs.tsx`, `popover.tsx`, `tooltip.tsx`
  referenced tokens this theme does not define. Modal wraps Radix Dialog directly.
