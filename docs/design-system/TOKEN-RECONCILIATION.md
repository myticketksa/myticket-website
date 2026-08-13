# Token reconciliation — reference guides vs live Figma

The two reference guides in `docs/reference/` describe an **earlier iteration**
of the MyTicket design system. Where they disagree with Figma, Figma wins.

This file records the divergences so that nobody later "fixes" correct code to
match a stale document.

## What the guides get right

These were spot-checked against Figma and are accurate. Keep using them.

- **Every node ID.** `get_metadata` on Home `207:4362` returned exactly the 13
  sections `implementation-guide.md` documents, in order. All 25 design-system
  component node IDs resolved to the right components.
- **The routing map.** 52 routes with their Figma node IDs.
- **The page and screen inventory**, including frame dimensions.
- **Section padding rhythm** on Home (Hero 60, Talents 84, Categories 72,
  Events 60, Featured 76, Auction/Experiences/Organizers/Vendors 88, CTA 96).
- **Letter-spacing px values** — these turn out to be correct conversions of
  Figma's percentages, which is what let us prove the percent unit.
- **The 1320px section content width** inside a 1440px frame.

## Divergences

### Token naming is entirely different

The guides use Figma's old `category/name` slash convention. The live file uses
CSS-style `--category-name` variables authored directly as such.

- `surface/canvas` is now `--bg-page`
- `surface/card` is now `--surface-default`
- `surface/footer` is now `--bg-warm`
- `surface/brand-wash`, `bar/brand-wash`, `zone/brand-wash` collapsed into `--bg-tint-brand`
- `surface/skeleton` is now `--bg-skeleton`
- `border/subtle` is now `--border-divider`
- `brand/link` is now `--ink-brand-mid`
- `brand/hover` is now `--ink-link-hover`

### Values that actually changed

- **`ink/muted`** — guide `#6B5F58`, Figma `#8e8078`. The guide's value now
  lives on `--ink-secondary`. Using the guide here would make all muted text
  too dark.
- **`ink/inverse`** — guide `#FFF7F3`, Figma `#ffffff`.
- **`ink/disabled`** — guide `#C0AEA4`, Figma `#b9aca4`.
- **`brand/gradient-to`** — guide `#E0451A`, Figma `--brand-gradient-end`
  `#d8431a`. `#e0451a` still exists but as `--brand-identity-end`.
- **The brand gradient has three stops**, not two: start `#ff9147`, mid
  `#f25f2c`, end `#d8431a`.

### The spacing scale was rebuilt

Guide: 8, 12, 14, 18, 20, 40, 88 on names `2xs, xs, sm, md, lg, gutter, section`.
Figma: 4, 8, 12, 16, 20, 24, 32, 40, 56, 88 on names `xs, sm, md, lg, xl, 2xl,
3xl, 4xl, 5xl-min, 5xl-max`.

The names collide with different values — guide `space/lg` is 20, Figma
`--space-lg` is 16; guide `space/sm` is 14, Figma `--space-sm` is 8. This is the
most dangerous divergence, because code written against the guide's names would
compile and look almost right.

### The radius scale was rebuilt semantically

Guide: `sm 12, md 14, lg 18, xl 20, 2xl 22, pill 999` — a t-shirt scale.
Figma: `badge 10, control 14, card 18, search 22, pill 999` — named by purpose.

### Semantic state colours are new

Figma has a full `--state-*` family (success, danger with three shades plus a
border, info, inactive) with matching tints. The guides have none; they express
status only through the ad-hoc `tag/*` and `badge/*` pairs, most of which no
longer exist as variables.

### The elevation style in the guides does not exist

The guides record a single `Elevation/Card` as
`0 1px 2px rgba(25,16,8,.06), 0 8px 32px rgba(25,16,8,.08)` — a soft two-layer
halo. The live file has **two** drop shadows and neither resembles that:

- `Elevation/Lift` — `0 12px 30px -18px rgb(25 16 8 / 0.35)`
- `Elevation/Overlay` — `0 40px 80px -30px rgb(25 16 8 / 0.6)`

These are far stronger (35% and 60% alpha versus 6% and 8%) and use large
negative spreads to stay tight and directional. Using the guide's value would
make every card in the app look flat.

### Focus and shape tokens the guides say don't exist

The guides state under Accessibility that there are "no focus-ring styles".
There are: `--border-focus` `#f25f2c` and `--size-focus-ring` `2`. Also present
and absent from the guides: `--radius-input` 12, `--radius-panel` 22,
`--size-icon-lg` 24.

### Text style names and some metrics changed

- `Display/XL` is now `Display/Hero XL`
- `Display/L` is now `Heading/H1`
- `Display/S` is now `Heading/H2`
- `Display/Card` / `Title/L` is now `Heading/Card`
- `Body/M` (16px) is now `Body/Default` at **15px**
- `Body/S` (14px) is now `Body/Small`
- `Body/XS` (13px) is now `Body/Caption`
- `Eyebrow` is now `Label/Overline`
- `Title/XL` is now `Heading/H4`

Styles with no guide equivalent: `Display/CTA` (50px, lh 0.98),
`Heading/H2 Home` (44px), `Heading/H2 Feature` (38px),
`Heading/H2 Section` (34px), `Numeric/Default` (22px), `Label/Error` (12.5px),
`Label/Table` (11.5px) and `Label/Group` (12px).

The guide's `Action/*`, `Link/*`, `Tag/*`, `Price/*`, `Nav/M`, `Meta/Date`,
`Logo/*` and `Medium/*` families **do not exist** in the live file. Foundations
Typography has now been read in full and returns 22 styles; none of those
families appear. Button and link text uses the `Label/*` and `Body/*` families
instead, and prices use `Numeric/Default`.

The guide claims 36 text styles. The live file has 22.

### Sizing tokens are new

`--size-header` 80, `--size-search` 44, `--size-icon-sm` 16,
`--size-border-hairline` 1, `--size-border-interactive` 1.5, and
`--size-content-max` 1400 have no guide equivalent. Note the guide's claim that
content is 1320px wide is right for page sections but wrong for the header and
footer, which use 1400.

### Component inventory drift

The guides list `Select`, `Textarea`, `AmountInput`, `FieldLabel`,
`InlineError`, `CharacterCounter`, `MeterBar`, `AttributeTag`, `VersionPill`,
`LanguagePill` and the data blocks — all confirmed present.

But the guides describe `Button` as "5 styles x 3 sizes x 4 states", implying 60
combinations. Figma has **18**. Building a full matrix would invent 42 variants
that no designer approved.

Similarly `EventCard` is documented with Home and Catalog contexts; in Figma
`EventCard` has only `Context=Home`, and Catalog is a separate component
`EventCard/Catalog`. The same split applies to `TalentCard/Directory`.

### Stack guidance superseded by the user

The guides recommend React Context plus TanStack Query for state. The project
uses Redux Toolkit with RTK Query instead, per explicit instruction. Zod is used
for validation as the guides suggest, paired with React Hook Form.

## File key

The original file `MvbBN5eknD2xUD5LhUBeBS` is unreadable over MCP: the account
holds only a View seat in its owning team, which caps reads at 6 per month.
It was duplicated into the Pro team as `yffYsbbooJbCZMYbAWSMfH`, which preserved
every node id. All node ids recorded in these documents remain valid; only the
file key changed. The canonical key lives in
[src/lib/figma-nodes.ts](../../src/lib/figma-nodes.ts).

## Provisional values

None. Every token in the theme layer is now an extracted Figma value.
