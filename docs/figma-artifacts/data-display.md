# Data display — Figma artifact

Source file `yffYsbbooJbCZMYbAWSMfH`, page **Design System** (`86:962`).
Twelve atoms, built to `src/components/data-display/`.

Every measurement below came from `get_design_context` on the node id given. Where
Figma's drawing and Figma's stated rule disagree, the drawing was followed and the
conflict is recorded — those are the places to check first if something looks wrong
against the live file.

---

## StatusBadge — `207:1750`

Figma draws **25 labels** that are geometrically identical: 12px/700, padding
`4px 10px`, radius 10, no icon. They differ only in paint, and the paints collapse
to **nine recipes**:

| Recipe | Fill | Text | Border |
| --- | --- | --- | --- |
| `brandTint` | `--bg-tint-brand` | `--ink-brand-strong` | none |
| `urgentSolid` | `--brand-identity-end` | `--ink-inverse` | none |
| `terminal` | `--surface-inverse` | `--bg-page` | none |
| `neutralOutline` | `--bg-page` | `--ink-secondary` | 1px `--border-default` |
| `liveSolid` | `--state-success` | `--ink-inverse` | none |
| `successTint` | `--state-success-tint` | `--state-success` | none |
| `inactive` | `--state-inactive` | `--state-inactive-ink` | none |
| `infoTint` | `--state-info-tint` | `--state-info` | none |
| `dangerTint` | `--state-danger-tint` | `--state-danger-deep` | 1px `--state-danger-border` |

Two details that are easy to get wrong:

- **`terminal`'s label is `--bg-page`, not `--ink-inverse`** — warm off-white on
  near-black, not pure white.
- `✓ Verified` and `● Available` carry their glyphs as **literal text**, not icons.
  `OverlayBadge`'s dot is the opposite (a vector), so the two are not
  interchangeable.

The variant axis is the recipe, and the label is free text. `STATUS_TONES` maps all
25 source labels to their recipe so a status string cannot drift onto the wrong
colour. Read-only by design; the interactive equivalent is `FilterChip`.

## FilterChip — `207:1769`

h38, px14, radius 19, 14px/500, gap 8. Figma's rule: *"Filter chips are interactive
pills; status badges are read-only labels."*

Selected fills with `--gradient-identity` and has **no visible border**. The source
still gives it `1px solid transparent` — Figma's inside strokes do not affect frame
size, so Selected is the same height as Default without a stroke. A CSS border is
inside the box model too, so transparent reproduces the parity exactly.

`removable` is the applied-filter tint chip: `--bg-tint-brand`, 600 weight,
`--ink-brand-strong`, with a **literal U+00D7** rather than an icon.

Hover is not drawn. Moving the border to `--border-focus` is a deliberate addition —
an interactive pill with no hover feedback reads as broken.

## OverlayBadge — `207:1783`

Sits over card imagery. 12px/700, padding `4px 10px`, radius 10, no border, on
`--surface-default` **at 92% paint opacity**, so artwork shows faintly through.

The Success tone's leading dot is an **8px filled vector circle** with a 5px gap.

The `top: 10 / left: 10` offset is the card's, not the atom's, so it is not baked in.

## CountBadge — `207:1795`

`--brand-identity-end` on white. The two platforms are asymmetric, and that is
declared, not an oversight:

- `web` — height 16, **min-width** 16, radius 8, 9.5px/800. Hugs, so it widens past
  one digit.
- `mobile` — fixed **14×14**, radius 7, 8.5px/800. Will not grow.

No token covers any of these sizes, radii or font sizes; all are literals in the
source and stay literals here. Offsets (web `-4`, mobile `-3`) belong to the host
icon button.

## Avatar — `207:1800`

Initials on `--gradient-identity`, white text. Two sizes drawn: **28×28 at
11.5px/700** (header account cluster) and **52×52 at 17px/800** (list rows). Shape is
a separate axis — Circle is `--radius-pill`, Squircle is `--radius-control` (14).

At 28px, radius 14 *is* height/2, so `sm` + squircle renders identically to
`sm` + circle. The pairs actually drawn are 28/Circle and 52/Squircle.

Deliberately absent, because the source has neither: **no 32px size** (no token, so
adding one means inventing both the size and its radius) and **no photo variant**.

## Skeleton — `207:1809`

*"Skeletons mirror final layout. Loading-more appends below existing content."*

- `media` — height 84, radius 12, carries the shimmer gradient. Its `#fbf4ef`
  highlight is a **literal**, not a token.
- `line` — height 13, radius 7, flat `--bg-skeleton`.

Both fill their container. Figma draws lines at 70% and 45% width but notes those
proportions belong to the call site; the drawn 280px is display-only.

**Animation is not specified.** Travelling the highlight is a deliberate addition — a
static shimmer band reads as a rendering bug — and it stops under
`prefers-reduced-motion`. The 10px row gap lives on `SkeletonStack`, since it is the
loading card's, not the atom's.

## Divider — `207:1812`

**Both tones are 1px.**

- `divider` (`--border-divider`) — hairlines *inside* cards and tables: spec-table
  rows, the tabs baseline, the money-total rule.
- `border` (`--border-default`) — edges *between* things: card outlines, panel
  separations, header and footer edges.

There is **no 1.5px divider anywhere**. The 1.5px weight in the foundations is a
*control* border (secondary buttons, search pill, icon buttons), so it is not a tone
here.

## MeterBar — `207:1815`

Track height 6, radius 3, `--bg-skeleton`. Fill is `--gradient-identity` **rotated to
90deg** — a left-to-right ramp, not the 120deg diagonal used elsewhere.

The three widths drawn (78%, 15%, 5%) are data, not variants, so the fill is driven
by `value`. The drawn 200px track is display-only.

## StarRating — `207:1817`

**The star is a literal U+2605 text glyph, not `Icon/Star`.** The source renders it as
text at every site, so substituting the icon component would change the shape.

- `strip` — five stars at 15px, 2px letter-spacing, `--ink-brand`. There is **no
  partial or empty star**; the source always draws five filled.
- `inline` — 12.5px, `--ink-muted`, 6px gap, as on cards ("★ 4.8 · 1.2k going").

Weight is undeclared at both sites, so both use 400 — the initial value the source
actually renders.

**Unresolved conflict.** The stated rule is *"Stars are brand/500, one decimal
always"*, yet no drawn inline instance paints the star brand — the whole string is
muted. The drawing wins; `brandStar` opts into the rule's version.

The 30px/800 score display is not here — it belongs to `RatingSummary` (`207:3061`).

## PriceDisplay — `207:1827`

*"Format: SAR 1,240.00, tabular. The platform fee is always its own line — never
folded into a price. Wallet balances always show the withdrawable / spend-only
split."*

| Context | Type |
| --- | --- |
| `card` | 14px/700 |
| `row` | 14px/400 |
| `total` | 14px/700 |
| `amount` | 22px/600 |
| `stat` | 26px/800, tracking −0.52 |
| `mobile` | 12px/700 |

`card` and `total` are drawn identically and differ only in tabular figures, which
Figma's API cannot express. **Every price in the system is tabular in the source and
none of them is tabular in Figma**, so `tabular-nums` is applied to all six — a
restoration of stated intent, not an addition.

## Countdown — `207:1840`

12px/700, tabular, 24h clock. The colour rule: **under an hour is `--ink-brand-mid`,
over an hour is `--ink-muted`.** Only the under-1h case is drawn (the stat-card timer
"Ends 00:41:22"); the over-1h geometry is carried across rather than invented, which
Figma flags.

**Unresolved conflict.** `DeadlineBanner` (`207:2895`) draws "02:12:40" — an over-1h
value — at **15px/800 in `#c4330b`**, contradicting the rule on both colour and size.
That instance belongs to the banner and is not built here; reconcile it when
`DeadlineBanner` lands.

Announced through a polite live region, per the accessibility note.

## ImagePlaceholder — `207:1845`

`--gradient-placeholder` at 160deg with a centred caption in `--ink-muted`. Both
gradient stops (`#e8ddd6`, `#d8ccc4`) are literals Figma **explicitly leaves
untokenised** — the only unbound colours in the system, and the first thing to bind if
the imagery palette is ever tokenised.

**The source states ratios, not pixels.** The drawn 320px width is arbitrary and each
variant locks an aspect ratio, so the component sets `aspect-ratio` and fills the
available width.

| Ratio | Used for | Caption |
| --- | --- | --- |
| 16:10 | event and experience card imagery | 12px |
| 1:1 | talent photo | 12px |
| 16:9 | mobile event card | **11px** |

---

## Cross-cutting notes

**Tokens consumed, none invented.** Every colour, radius and gradient above resolves
to a variable already in `theme.css`. The literals that remain — the shimmer
highlight, the placeholder stops, the CountBadge geometry, the per-context price type
— are literals *in Figma*, so reproducing them as literals is faithful rather than
lazy.

**Deliberate additions, all three motivated by the drawing being incomplete rather
than by preference:** the FilterChip hover border, the Skeleton shimmer animation, and
`tabular-nums` on PriceDisplay and Countdown.

**Offsets stay with hosts.** OverlayBadge's 10px inset, CountBadge's negative
offsets, and Skeleton's 10px row gap are all positioning decisions the source assigns
to the parent card or button, so no atom hard-codes them.

Verified: `tsc -b` clean, `vite build` clean, and every generated utility
(`bg-identity-gradient`, `bg-shimmer`, `bg-surface-default/92`, `size-avatar-*`,
`rounded-badge`, `rounded-chip`, `h-chip`, the arbitrary values) confirmed present in
the built stylesheet. All twelve render in `ProbeRoute`.
