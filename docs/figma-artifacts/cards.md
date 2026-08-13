# Cards — Figma artifact

Source file `yffYsbbooJbCZMYbAWSMfH`, page **Design System** (`86:962`).
Built to `src/components/cards/`, with two chip atoms filed under
`src/components/data-display/`.

Read this alongside `data-display.md`. The single most important thing it records is
that **the cards almost never instance the design-system atoms**, and that this is
deliberate rather than sloppy authoring. Figma says so explicitly on the event card,
listing four separate mismatches against `OverlayBadge`. Substituting the atom for the
local chip would be visibly wrong, so each card redraws what it needs and the reasons
are captured per component.

## The rule this layer is built on

Every card's Figma response carries two things: a written description and the exported
drawing. **They disagree constantly** — on font weights, on opacity, on radius, on
whether a glyph is text or a vector, sometimes on the price's size *and* colour. The
drawing is the artefact the design was actually made in, so the drawing wins every
time, and each divergence is written into the component's doc comment where the next
reader will trip over it.

The second recurring trap is that Figma reports a **different gradient angle on
nearly every instance** (133.49, 134.37, 135.30, 141.67, 152.54, 162.67, 163.15, 168.05
all appear). It stores a gradient as a transform over each layer's bounding box, so the
angle drifts with aspect ratio. The angles are normalised to the four ramps in
`theme.css`; per-instance angles are never reproduced.

---

## Icon sources: the file has two

This surfaced while building the cards and it changes how every card is written.

The custom set at `207:1595` — twelve glyphs, 2px stroke, 24 grid — is what the
**design-system documentation** uses. The **real page cards draw from Phosphor**
(`207:3385`). Three glyphs were identified by downloading the exported SVGs and
matching geometry:

| Figma node name | Actually | Wrapped as |
| --- | --- | --- |
| `icon/star-fill@13`, `@12` | Phosphor `Star`, fill weight | `StarFillIcon` |
| `icon/circle-fill@8` | Phosphor `Circle`, fill weight | `CircleFillIcon` |
| `icon/heart@15`, `@14` | Phosphor `Heart`, **regular** weight | `HeartGlyphIcon` |
| the organizer directory check | Phosphor `Check`, **regular** weight | `CheckGlyphIcon` |

The check is the interesting one: `VerifiedIcon`, the two-tone brand burst, appears in the
**same "verified" slot** on the talent and vendor cards. The organizer card draws a plain
Phosphor check instead. Two different marks for one idea is what the source contains, so
that is what ships.

Two details worth keeping:

- The circle is r=3.25 in an 8px box — Phosphor's 104/256 radius. Drawing it by hand as
  `r=4` comes out visibly too large, which is what the first pass of `OverlayBadge` did
  before the asset was checked.
- Figma's description calls the heart *"the literal ♡ (U+2661) the source renders, not
  Icon/Heart"*. The drawing contains a Phosphor vector. The drawing wins.

These live in `src/components/icons/card-glyphs.tsx` with the weight pinned, separate
from `phosphor.ts`, which covers glyphs the custom set simply has no equivalent for.

In every case the star takes its row's own text colour — `--ink-primary` on the Home
talent card, `--ink-muted` on the Catalog one, `--bg-page` on the directory card's dark
pill — so it inherits `currentColor` rather than setting a fill.

---

## TalentCard — `207:3115` (Context=Home)

Radius **20**, 1px `--border-default`, media a fixed 208 band. Drawn 250 wide; width is
the grid's, so it is not fixed.

Body: padding `15 16 17`, then name row (16px/700, gap 6, a 16px verified mark) →
3px → discipline 13px/500 → 10px → meta row (`justify-between`: a 13px/700 rating with
a 13px/500 muted count, against a 13px/500 city) → 11px → divider → 11px →
`APPEARING NEXT` → 3px → event headline 13px/600.

The top-left pill is **not** `OverlayBadge`: radius 12 against 10, 5px vertical padding
against 4, 11px against 12, and an opaque white ground rather than 92%. Four
mismatches, so it is local.

`APPEARING NEXT` is 11px/700 with 0.66 tracking — a **fourth** uppercase micro-label,
distinct from `Label/Overline` (12/800/1.2), `Label/Table` (11.5/700/0.805) and
`Label/Group` (12/700/0.6). It is a raw text node, not a named style, so it stays a
literal.

## TalentCard/Directory — `207:3139`

Its own component, not a variant of the above. Figma flags it as the resolution of a
conflict it had left open: the DS-doc `Catalog` variant (1:1 media, status badge, 16px
name) and the live Talents page disagreed, and *"Context=Directory … closes the ROADMAP
rebuild decision."* **The Catalog variant is documentation-only and is deliberately not
built** — no page uses it, and Figma itself supersedes it.

Radius 16. Media is a flat **`--bg-skeleton`**, not the placeholder gradient — the only
card whose empty media carries no caption.

Both overlay pills are local: radius 13, 5px vertical padding, and translucent fills of
`--bg-page` at 94% and `--ink-primary` at 72%.

Body: padding `16 16 18`, name 18px/600 → 6px → discipline 14px/400 → 6px → meta
13px/400 → 10px → a next-show panel (radius 12, `--bg-page` on `--border-divider`,
padding `11 12`) → flex spacer → 12px → the CTA row.

Two divergences, both recorded rather than smoothed over:

- The CTAs are drawn **h40 / radius 20**, which matches no button size in the system
  (M is 42/21, the state-card CTA is 36/18). `Button` is overridden to 40.
- `Follow` is drawn with a 1px border where the DS secondary button is 1.5px. `Button`
  keeps 1.5px — forking the button over half a pixel costs more than it buys.

Neither talent card uses `--radius-card` (18). The token exists; 20 and 16 are what is
drawn, so both are literals.

## EventCard — `207:3255` (Home) and `207:3276` (Catalog)

The two are **geometrically identical** — same radius 16, same 186 media band, same
chips, gaps and padding — and differ only in type weight and two paint details, so
`context` is the variant axis and the structure is shared.

| | Home | Catalog |
| --- | --- | --- |
| date overline | 800 | 600 |
| title | 700 | 600 |
| venue, attendance, "From" | 500 | 400 |
| rating | 700 | 500 |
| price | 19px/800 `--brand-identity-end` | 18px/600 `--ink-primary` |
| favourite | opaque `--surface-default`, radius 17, heart 15 | `--bg-page` at 94%, radius 16, heart 14 |

Media is a **fixed 186 band, not a ratio**, and Figma flags the disagreement itself:
the documented spec says 16:10, and 186px is not 16:10 at any card width, so the drawing
releases the placeholder's aspect lock and stretches it.

Overlays: flag chip top-left (radius 12, padding `4 9`, 11px/600, `--brand-gradient-end`
on `--ink-inverse`), favourite top-right, category chip **bottom**-left (opaque
`--surface-inverse` with `--bg-page` text — the description claims ink at 78% on
`#FFF7F3`, and the drawing says otherwise).

Body: padding `15 16 16`, gap 7 throughout, then a flex spacer and a footer above a 1px
`--border-divider` rule, baseline-aligned, with "From" left and the price right.

Nothing here is an instance. Beyond the `OverlayBadge` mismatches, the meta row splits
into two colours where `StarRating` inline is one muted string, and neither price
matches `PriceDisplay` card (14px/700).

The title is 17px at 1.22 line-height — `Heading/Card` exactly, except that style
carries −0.255px tracking and this text node carries none, so it is written out rather
than reusing the class.

Two smaller reconciliations: the rating figure is bound to `--surface-inverse`, the same
`#191008` as `--ink-primary` but a surface token doing a text job, so `--ink-primary` is
used; and the price gets `tabular-nums`, which every price in the system is specified to
have and none of them carries in Figma.

**Not built, because the source never draws them:** hover — the spec says `shadow/lift`,
the page says a `#FFC8AE` border, and neither is a drawn state — and the favourite's
saved state.

## ExperienceCard — `207:3167` (Catalog) and `207:3177` (Home)

Shared: 1px `--border-default` on `--surface-default`, a media band fixed at **200**, shell
clipped. Everything else diverges, so `context` carries two separately written bodies.

| | Catalog | Home |
| --- | --- | --- |
| radius | 16 | 20 |
| body padding | `14 16 16` | `15 16 17` |
| title | 16px/700 at 1.25 | `Heading/Card` (17/700/1.22/−0.255) |
| second line | 13px/400 `--ink-secondary` | 13px/600 `--brand-gradient-end` |
| then | a wrapping tag row, gap 6 | a summary at 13px/500, then a rating row |
| media overlays | **none** | a category chip bottom-left |

The description insists the media is *"a RATIO, not pixels"*; the export draws a fixed 200
on both variants and the Home card is 315 wide, where 200 is not 16:10. Same call as the
event card's 186. The description also frames Catalog as *"the same shell as O4"*, which
the export contradicts on radius, padding and the entire type ramp.

The tag row **does** reuse `AttributeTag` — it matches its instance exactly, which makes it
one of the few genuine atom reuses in this folder. The category chip does not reuse
`OverlayBadge`: radius 12 against 10, 5px vertical padding against 4, 11px against 12.

Figma explicitly forbids inventing a third tag label, so the tag list is caller-supplied
and nothing is defaulted.

## VendorCard — `207:3303` (Row) and `207:3317` (Directory)

Not two arrangements of one layout — Row is a horizontal strip for the Home marketplace
section and Directory is the vertical card the Vendors page draws.

**Row:** radius 20, padding 18, gap 15, centred. A 64×64 logo at radius 16. Name 16px/700
with `VerifiedIcon` at 16, gap 6; services 13px/500; a meta row with a uniform 12 gap
carrying the star, the rating at 700 and the coverage note at 500.

**Directory:** radius 16, clipped, a flat `--bg-skeleton` band 168 tall with **no
placeholder and no caption**. Two overlay pills inset 12 — the same pair
`TalentCard/Directory` draws, but inset 12 rather than 16. Body `16 16 18`: name 18px/600,
services 14px/400, meta 13px/400, then a price row over a 1px `--border-divider` rule, then
the CTA pair.

**The export binds no spacing token anywhere on this card** — every gap, pad and inset comes
back as a bare pixel. So they all stay literals, including `gap-[8px]` where `gap-sm` has
the identical value. A literal that happens to equal a token is still a literal.

The `View profile` gradient binds its midpoint to `--ink-brand` rather than
`--brand-gradient-mid`. Both are `#f25f2c` and the ramp is the brand ramp, so it takes
`bg-brand-gradient`; the reported 164deg and the 13.4/86.6 stop offsets are the
bounding-box artefact, not a distinct gradient.

Figma marks the Directory body `shrink-0` while placing a `·grow` **inside** it, which is
self-contradictory. The spacer is there to be honoured, so the body grows and the price row
and CTAs align across a row of cards.

## OrganizerCard — `207:3348` (Tile) and `207:3362` (Directory)

**Tile:** radius 20, padding 18, a centred column. A circular 66×66 mark at radius 33; name
full-width centred at 15px/700, 1.25, −0.225 tracking; a meta row of three 13px/500 nodes;
`Follow` pinned to the bottom, full width, 36 tall at radius 18 with a 1.5px border.

**Directory:** radius 18, clipped. A 116 flat cover, with the 56×56 logo mark absolutely
placed on a **3px `--surface-default` ring** and painted last so it overhangs the cover.
The body has 20 sides and bottom and **no top padding** — Figma opens it with a 40px `·sp`,
which is what clears the overhanging mark, so that becomes a margin on the name row.

Two things left exactly as drawn rather than quietly improved:

- Figma gives the tile's two meta strings fixed widths of 66 and 19px, which are simply the
  measured widths of the drawn text. Those were dropped so the row hugs.
- The Directory variant draws **no `·grow`**, so its CTAs are not pinned to the bottom and a
  row of cards with different name lengths will not align them. That is as drawn.

The Tile's `Follow` is Button-secondary-S geometry to the pixel (36/18/1.5px/13px) but is
drawn at **700** where that size is 600, so it is local. The Directory pair at 38/19 matches
no button size at all, and its `Follow` uses `--gradient-identity`, not the brand ramp.

Radius 18 on the Directory shell equals `--radius-card`, but the export writes a bare
literal, so it stays one.

## FeaturedHeroCard — `207:3194`

Height **494 is kept** while the width is dropped: the card is `justify-end` over a media
ground and has no content-driven height at all, so without it the card collapses to its four
lines of text. Radius 22, padding 18. A top row absolutely inset 16 on three sides; pills
11px/700 at `11×5` and radius 13; a favourite at exactly the icon-button tokens, 34 box and
17 radius. Content: overline 12px/700 at 0.72 tracking → 7 → title 28px/700 at 1.03 and
−0.7 → 6 → venue row → 14 → price row with "From" at 14px/500 and the figure at 19px/800 on
a shared baseline → CTA 38 tall at radius 19.

**The ground gradient matches none of the four ramps and needs a design decision.** It
reports `#ff9147 → --ink-brand → --ink-link-hover`, so its last stop is `#b8320f` where
`--gradient-brand` ends on `#d8431a`. It is written as a literal at the normalised 135deg
rather than folded into `bg-brand-gradient`, which would silently change the colour.

The Tickets CTA is the mirror image: reported at 141.59deg, but its two stops are exactly
`--gradient-identity`, so it takes the utility and the per-instance angle is dropped. That
contrast is the clearest illustration in the file of when to normalise an angle and when not
to.

The CTA misses `Button` on **five** axes at once — 38 against 42, radius 19 against 21,
13px/700 against 14px/600, and the identity ramp where `primary` carries the brand ramp — so
it is a plain button rather than a five-property override.

`#ffb48a`, the overline's warm-on-dark ink, is the only unbound colour on the card.

## FeaturedPanelCard — `207:3220`

Radius 20, a media band fixed at 220, body padding `18 18 20`. Overline 12px/800 at 0.6
tracking → 7 → title 26px/700 at 1.05 and −0.78 → 8 → venue 14px/500 → 16 → a meta row with
the price at 16px/800 and the rating pair at 13px/500.

**Its border is `--ink-primary` at 7%**, where every other card in the file uses
`--border-default`. Kept as drawn: a warm-grey hairline behaves differently over a tinted
panel than the pink token does. If white-on-tinted becomes a pattern this wants a
`--color-border-on-panel`.

The overline is 12px/800 like `Label/Overline` but tracks 0.6 against that style's 1.2, so it
is written out. The price is a single text node including its "From" label, so it is one prop
rather than the split the event card uses.

This card **does** reuse `ImagePlaceholder` — the instance is genuine, with the atom's own
gradient stops and caption, stretched to a fixed height with its 16:10 lock released.

## AuctionCard — `207:3235`

Radius 20, a `--border-default` hairline, padding 18, a uniform 14 gap between three blocks.
A listings pill at 12px/700, `10×5`, radius 12; the countdown at 12px/800; the title, then a
sub-line; a divider; then an amounts row aligned on bottom edges, each column a 12px/500
`--ink-muted` label above its figure, with the bid at 21px/800 in `--brand-identity-end` and
buy-now at 15px/700.

**This is the second component to break the `Countdown` rule.** "Ends in 02:41:18" is an
over-an-hour value drawn at 800 where the atom is 700, in a brand red where the atom's rule
says over an hour is `--ink-muted`. The timer is drawn locally and the atom is untouched.
The telling detail for whoever settles this: the export binds `--brand-gradient-end`, whose
`#d8431a` is the same value as the `--ink-brand-mid` the atom uses for *urgent* — so either
every auction is deliberately urgent or the rule needs rewriting. `DeadlineBanner` breaks it
the same way.

The listings pill is not `StatusBadge` either: same tint ground, but 5px vertical padding
against 4, radius 12 against 10, and `--brand-gradient-end` text where `brandTint` uses
`--ink-brand-strong`.

The title is the one card title in the file that matches `Heading/Card` outright, tracking
included, so it uses the class. `Divider` at its default tone matches the drawn rule exactly
and is reused.

## CategoryChip — `207:3097`

h42, radius 21, padding `0 16`, gap 8, 1.5px `--border-default` on `--surface-default`,
name 14px/600, count 12px/600 at **55%**.

Filed next to `FilterChip` in `data-display/` because the two are near-twins that differ
in five measurements — h42 against h38, radius 21 against 19, padding 16 against 14,
weight 600 against 500, count opacity 55% against 60%. Reaching for the wrong one is
easy, so they sit side by side.

Its shell matches `Button` size M exactly (42/21), but the padding does not (16 against
18) and it is a navigation target rather than an action, so it is not built on `Button`.

## LoadingCard — `207:2920`

An 84px media block then two lines, stacked at `--space-row-gap` (10px), with an optional
footnote 12px below. **One of the few cards that does compose DS atoms** — all three
blocks are real `Skeleton` instances.

Line widths are 70% and 45%, which Figma resolves against the 320px specimen as 224 and
144. They are proportions, so they stay percentages.

The footnote text in the source is documentation prose, not product copy, so it is not
defaulted.

Figma states twice that no animation is specified and none was invented. The shimmer
travel comes from the `Skeleton` atom, where it is recorded as a deliberate addition.

The panel this sits in (radius 18, padding 20, a "Loading — skeleton" label) is a
`SpecPanel` and is not part of this component.

---

## Not built, and why

- **`TalentCard` Context=Catalog (`207:3101`)** — documentation-only. Figma raised the
  conflict between it and the live page, then resolved it by adding the Directory
  component. No page renders Catalog.
- **`VersionPill` (`207:1789`)** — Figma's own description: *"documentation chrome, not a
  product status; do not add it to the status taxonomy."* It is chromatically and
  geometrically identical to `StatusBadge` with the `brandTint` recipe, and it labels the
  Figma document itself, so it has no product call site.

## A bug this layer uncovered: `cn()` was deleting the type ramp

Building the cards surfaced a live defect in `src/lib/cn.ts`, not a style quibble.

The text styles in `typography.css` are custom utilities named `text-<role>-<variant>`,
which collides with Tailwind's own `text-<colour>`. `tailwind-merge` classified them as
colours and dropped them:

```
twMerge('text-label-badge text-ink-brand-strong') → 'text-ink-brand-strong'
```

So **every place a style and a colour met in one `cn()` call, the style was silently
discarded** and the text fell back to whatever it inherited. That included all nine
`StatusBadge` tones losing `text-label-badge` (12px/700), both `Field` labels, the section
headers and the footer.

`cn()` now registers the five role prefixes — `display`, `heading`, `body`, `numeric`,
`label` — as font-size classes. Matching on the prefix rather than listing the twenty-two
current style names means a new style added to `typography.css` is covered without touching
`cn.ts`, and no colour token begins with one of those words, so there is no ambiguity the
other way. `scripts/check-cn.mts` guards both directions: styles must survive alongside a
colour, and genuine conflicts must still collapse.

## Open decisions for the design side

These are recorded rather than decided, because each one is a design call and not a coding
one.

1. **A fifth brand ramp?** The hero card's ground (`#ff9147 → #f25f2c → #b8320f`) matches
   none of the four normalised ramps, differing from `--gradient-brand` only in ending on
   `--ink-link-hover` instead of `--brand-gradient-end`. Either it deserves a token or Figma
   has a mis-bound stop.
2. **A button size between S and M.** The scale is 48 / 42 / 36; the cards draw **40**
   (talent directory, vendor directory) and **38** (organizer directory, hero CTA). The 40/20
   pair is now handled uniformly as a two-value override on `Button`, but 38/19 is still
   local in two places. Curiously 38/19 is exactly `--spacing-chip` / `--radius-chip`, which
   are chip tokens and were not pressed into button service.
3. **One `OverlayBadge` variant would collapse six local copies.** Across the event, talent,
   vendor and experience cards there are now six overlay chips, clustering at radius 12–13,
   5px vertical padding, 11–12px type and translucent 72–94% grounds — against the badge's
   radius 10, 4px, 12px/700 and opaque fill.
4. **`--color-border-on-panel`**, for the panel card's `--ink-primary` at 7%.
5. **A dark-ground card scrim token**, for the hero's four-stop 180deg ink ramp.
6. **`tabular-nums` beyond 22px.** It lives only in `text-numeric-default`, so every card
   price adds it by hand — six times so far.
7. **Unbound shape values.** No card radius token covers the set in use: `--radius-card` is
   18 and the cards draw 16, 18 and 20. Also unbound: radii 9, 12, 13, 19, 28, 33, and the
   3/9, 5/10, 15, 17, 18 padding values.

## New to the token layer

`--gradient-brand-compact` — the two-stop `gradient/cta-compact` ramp
(`#FF9147 → #D8431A`, no mid stop) that Figma keeps *"distinct"* from the three-stop
brand ramp and uses only on the compact state-card CTA (`207:1687`, h36 / radius 18 /
13px/600 / padding 16). Exposed as `bg-brand-gradient-compact` and wired to
`Button variant="cardCta"`, which is valid only at size `sm` and takes 16px padding
rather than the 15px the standard S button uses.
