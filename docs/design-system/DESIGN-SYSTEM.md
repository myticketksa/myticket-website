# MyTicket Design System — extracted from live Figma

> Source: Figma file `yffYsbbooJbCZMYbAWSMfH` — "MyTicket Design (Copy)"
> The original `MvbBN5eknD2xUD5LhUBeBS` is unreadable over MCP because the
> account holds only a View seat in its owning team. Duplicating it into the Pro
> team preserved every node id; only the file key changed.
> Extracted via Figma MCP (`get_variable_defs`, `get_metadata`)
> Status: token layer **complete**

This document, not `docs/reference/guide.md`, is the source of truth for tokens.
The reference guides describe an earlier iteration of the system; see
[TOKEN-RECONCILIATION.md](./TOKEN-RECONCILIATION.md) for the divergences.

---

## 1. Conversion rules

Two Figma-to-CSS conversions must be applied consistently everywhere.

**Letter spacing is a percentage of font size.**
`px = pct / 100 * fontSize`. Confirmed twice: `Label/Overline` at `10` on 12px
gives `1.2px`, and `Display/Hero XL` at `-3` on 56px gives `-1.68px` — both
match the px values recorded in the older guide, which proves the unit.

**Line height is a multiplier below 10 and a percentage above it.**
`1.14` means `1.14x`. `100` means `100%`, i.e. `1x`. A multiplier of 100 on a
12px label would be 1200px, so the large values can only be percentages.

---

## 2. Colour

Single mode. No dark theme exists in the file and none should be invented.

### Backgrounds
- `--bg-page` `#fff7f3` — the page canvas; body background, never pure white
- `--bg-warm` `#fff1e9` — footer and warm banding
- `--bg-tint-brand` `#fff0e9` — brand-tinted zones and bars
- `--bg-skeleton` `#f5ede7` — skeleton base

### Surfaces
- `--surface-default` `#ffffff` — cards and raised panels
- `--surface-inverse` `#191008` — inverse panels, dark CTAs

### Ink
- `--ink-primary` `#191008` — headings and primary text
- `--ink-secondary` `#6b5f58` — body copy
- `--ink-muted` `#8e8078` — meta, captions, de-emphasised text
- `--ink-disabled` `#b9aca4` — non-interactive text
- `--ink-inverse` `#ffffff` — text on inverse and brand surfaces
- `--ink-brand` `#f25f2c` — brand-coloured text
- `--ink-brand-mid` `#d8431a` — links
- `--ink-brand-strong` `#c4330b` — strong brand text, tier gold
- `--ink-link-hover` `#b8320f` — link hover

### Borders
- `--border-default` `#f3ded2` — control and card borders
- `--border-divider` `#f7e9e1` — hairline dividers
- `--border-focus` `#f25f2c` — focus ring colour

### Brand
- `--brand-primary` `#f25f2c`
- `--brand-gradient-start` `#ff9147`
- `--brand-gradient-mid` `#f25f2c`
- `--brand-gradient-end` `#d8431a`
- `--brand-identity-end` `#e0451a`

The brand gradient is a three-stop ramp, not the two-stop version the older
guide describes: `linear-gradient(90deg, start, mid, end)`.

There are **four** ramps in the system, and they are not interchangeable:

| Ramp | Stops | Angle | Carries |
| --- | --- | --- | --- |
| `gradient/cta` | start → mid → end | 135deg | primary buttons, CTA bands, the Home hero headline |
| `gradient/cta-compact` | start → end | 135deg | the state-card CTA only (`207:1687`) |
| `gradient/identity` | start → identity-end | 120deg | Toggle ON, selected FilterChip, Avatar initials, MeterBar fill (rotated to 90deg) |
| `gradient/placeholder` | placeholder-start → placeholder-end | 160deg | `ImagePlaceholder` |

`cta-compact` shares its endpoints with `cta` but drops the mid stop, so it has no
plateau at `--brand-primary`. Figma keeps the two *"distinct"* on purpose.

Figma reports a **different angle on nearly every instance** — 133.49, 134.37, 135.30,
141.67, 152.54, 162.67, 163.15 and 168.05 all appear in the file — because it stores a
gradient as a transform over each layer's bounding box, so the angle drifts with aspect
ratio. The angles above are the intent; per-instance angles are not reproduced.

### State
- `--state-success` `#1b8a5a` / `--state-success-tint` `#eaf6ef`
- `--state-danger` `#dc3a2a` / `--state-danger-tint` `#fff8f6` / `--state-danger-deep` `#a31c13` / `--state-danger-border` `#f5cbc5`
- `--state-info` `#3a6ea5` / `--state-info-tint` `#eef4fb`
- `--state-inactive` `#f5ede7` / `--state-inactive-ink` `#8e8078`

Semantic states are a first-class part of the live system. The older guide has
no equivalent, which is the single largest divergence.

### Neutral
These four are authored without the `--` prefix in Figma, so they are utility
values rather than exported CSS variables.
- `neutral/placeholder-start` `#e8ddd6` and `neutral/placeholder-end` `#d8ccc4` — the `ImagePlaceholder` gradient
- `neutral/shimmer` `#fbf4ef` — skeleton shimmer highlight
- `neutral/scrollbar` `#f5c9b4`

---

## 3. Spacing

A 4-based scale, materially different from the older guide's 8/12/14/18/20.

- `--space-xs` 4
- `--space-sm` 8
- `--space-md` 12
- `--space-lg` 16
- `--space-xl` 20
- `--space-2xl` 24
- `--space-3xl` 32
- `--space-4xl` 40
- `--space-5xl-min` 56
- `--space-5xl-max` 88
- `--space-control-gap` 9 — the one off-scale value, used for chip and control rows
- `--space-gutter-desktop` 40

`--space-5xl-min` and `--space-5xl-max` form the section rhythm band: sections
breathe between 56px and 88px depending on density.

---

## 4. Radius

- `--radius-badge` 10
- `--radius-input` 12 — text inputs and textareas
- `--radius-control` 14 — buttons and selects
- `--radius-card` 18
- `--radius-search` 22 — the search field
- `--radius-panel` 22 — panels; same value as search but a distinct semantic
- `--radius-pill` 999

---

## 5. Sizing

- `--size-border-hairline` 1 — dividers and resting borders
- `--size-border-interactive` 1.5 — focused and selected borders
- `--size-focus-ring` 2 — focus outline width
- `--size-icon-sm` 16
- `--size-icon-lg` 24 — the default icon size
- `--size-search` 44 — search field height
- `--size-header` 80 — site header height
- `--size-content-max` 1400

On width: `--size-content-max` (1400) governs the header and footer. Page
sections use a 1320px inner grid, verified from the Home frame where every
section child starts at `x=60` inside a 1440px frame.

---

## 6. Typography

Single typeface: `--font-latin` = **Manrope**. Weights in use: 500, 600, 700, 800.

22 styles. Each entry lists the Figma values followed by the computed CSS, and
maps to a `@utility` class in [typography.css](../../src/styles/typography.css).

**Display**
- **Display/Hero XL** — 56px / 800 / lh 1.14 / ls -3% → `56px / 63.84px / -1.68px`
- **Display/Hero** — 54px / 800 / lh 1.02 / ls -3.5% → `54px / 55.08px / -1.89px`
- **Display/CTA** — 50px / 800 / lh 0.98 / ls -3.5% → `50px / 49px / -1.75px`

**Heading** — note four distinct H2 variants, each for a different context
- **Heading/H1** — 46px / 800 / lh 1.03 / ls -3.5% → `46px / 47.38px / -1.61px`
- **Heading/H2 Home** — 44px / 800 / lh 1 / ls -3.5% → `44px / 44px / -1.54px`
- **Heading/H2 Feature** — 38px / 800 / lh 1.1 / ls -3% → `38px / 41.8px / -1.14px`
- **Heading/H2 Section** — 34px / 800 / lh 1.1 / ls -3% → `34px / 37.4px / -1.02px`
- **Heading/H2** — 32px / 800 / lh 1.1 / ls -3% → `32px / 35.2px / -0.96px`
- **Heading/H3** — 24px / 800 / lh 1.15 / ls -2% → `24px / 27.6px / -0.48px`
- **Heading/H4** — 19px / 600 / lh 1.3 / ls 0 → `19px / 24.7px / 0`
- **Heading/Card** — 17px / 700 / lh 1.22 / ls -1.5% → `17px / 20.74px / -0.255px`

**Body**
- **Body/Large** — 17px / 500 / lh 1.6 / ls 0 → `17px / 27.2px / 0`
- **Body/Default** — 15px / 500 / lh 1.55 / ls 0 → `15px / 23.25px / 0`
- **Body/Small** — 14px / 500 / lh 1.5 / ls 0 → `14px / 21px / 0`
- **Body/Caption** — 13px / 500 / lh 1.5 / ls 0 → `13px / 19.5px / 0`

**Numeric**
- **Numeric/Default** — 22px / 600 / lh 100% / ls 0 → `22px / 22px / 0`, set with
  `font-variant-numeric: tabular-nums` so counters and prices do not jitter

**Label** — every label style has line height 100%, i.e. exactly 1
- **Label/Overline** — 12px / 800 / ls 10% → `1.2px`, uppercase
- **Label/Group** — 12px / 700 / ls 5% → `0.6px`, uppercase
- **Label/Badge** — 12px / 700 / ls 0
- **Label/Field** — 13px / 600 / ls 0
- **Label/Error** — 12.5px / 600 / ls 0
- **Label/Table** — 11.5px / 700 / ls 7% → `0.805px`, uppercase

Two quirks worth preserving rather than tidying up. `Display/CTA` has a line
height below 1, intentional for the oversized CTA band headline. `Label/Error`
and `Label/Table` use half-pixel font sizes (12.5 and 11.5).

Heading and Display use `Manrope ExtraBold` (800) throughout; only `Heading/H4`
drops to SemiBold.

---

## 7. Effects

Two drop shadows and one blur, all exact values from node `207:2519`.

- `Elevation/Lift` — `0 12px 30px -18px rgb(25 16 8 / 0.35)`
- `Elevation/Overlay` — `0 40px 80px -30px rgb(25 16 8 / 0.6)`
- `Blur/Header` — `BACKGROUND_BLUR` radius 14, on the sticky site header

Figma's `spread` maps to the CSS spread-radius slot, which is why both shadows
carry a large negative fourth value — that is what keeps them tight and directional
rather than a diffuse halo.

There is no separate card shadow. `Elevation/Lift` is the card elevation, and
`Elevation/Overlay` is for modals and popovers.

---

## 8. Component inventory

Complete, from `get_metadata` on the Design System page (`86:962`). Dimensions
are exact Figma values. Variant names are verbatim, which matters because
several matrices are **sparse**.

### Inputs and controls
- `Button` `207:1630` — `Style x Size x State`, **sparse**. Existing combinations only: Primary L Default/Hover; Primary M Default/Hover/Disabled/Loading; Primary S Default/Hover; Secondary L Default/Hover; Secondary M Default/Hover; Ghost M Default/Hover; Destructive M Default/Hover; Icon M Default/Hover. Sizes L 48h, M 42h, S 36h. Icon M is 42x42.
- `Button — State-card CTA` `207:1687` — 123x36 standalone
- `TextInput` `207:1689` — `State=Default|Focused|Error|Disabled`, 320x48
- `Select` `207:1698` — 320x48
- `Textarea` `207:1700` — 320x92
- `FieldLabel` `207:1702` — 34x18
- `InlineError` `207:1704` — 242x17
- `CharacterCounter` `207:1706` — 149x16
- `SearchField` `207:1708` — `Size=Field` 240x44, `Size=Pill` 240x38, `Size=Icon` 34x34
- `Checkbox` `207:1717` — `State=Unchecked|Checked`, 21h
- `Radio` `207:1727` — `State=Unchecked|Checked`, 21h
- `Toggle` `207:1734` — `State=On|Off`, 26h
- `OTPBox` `207:1743` — `State=Filled|Empty`, 48x56
- `OTPGroup` `207:2868` — 216x81
- `AmountInput` `207:1747` — 115x56

### Data display
- `StatusBadge` `207:1750` — 9 tones, all 24h: BrandTint 63w, UrgentSolid 108w, Terminal 69w, NeutralOutline 122w, LiveSolid 71w, SuccessTint 49w, Inactive 50w, InfoTint 77w, DangerTint 79w
- `FilterChip` `207:1769` — `State=Default|Hover|Selected|Removable`, 38h
- `OverlayBadge` `207:1783` — `Tone=Ink|Success`, 24h
- `CountBadge` `207:1795` — `Platform=Web` 16x16, `Platform=Mobile` 14x14
- `VersionPill` `207:1789` — 43x24
- `AttributeTag` `207:1791` — 89x22
- `LanguagePill` `207:1793` — 61x32
- `Avatar` `207:1800` — `Size=28|52` x `Shape=Circle|Squircle`, full matrix
- `Skeleton` `207:1809` — `Type=Media` 280x84, `Type=Line` 280x13
- `Divider` `207:1812` — `Tone=Divider|Border`, 1px
- `MeterBar` `207:1815` — 200x6
- `StarRating` `207:1817` — `Form=Strip` 79x15, `Form=Inline` 101x17
- `PriceDisplay` `207:1827` — `Context=Card|Row|Total` 19h, `Amount` 137x30, `Stat` 105x36, `Mobile` 47x16
- `Countdown` `207:1840` — `Urgency=Under1h|Over1h`, 16h
- `ImagePlaceholder` `207:1845` — `Ratio=16x10` 320x200, `1x1` 320x320, `16x9` 320x180
- `Spinner` `207:1852` — 14x14

### Data blocks
- `SpecPanel` `207:2856` — 360x142
- `KeyValueRow` `207:2860` — 312x18
- `BulletRow` `207:2863` — 312x42
- `FacetList` `207:2865` — 108x51
- `MoneySummary` `207:3049` — 312x175
- `RatingSummary` `207:3061` — 312x163
- `StatCard` `207:3085` — 360x111
- `ListRow` `207:3091` — 360x88

### Cards
- `TalentCard` `207:3100` — `Context=Catalog` 320x430, `Context=Home` 250x370
- `TalentCard/Directory` `207:3139` — 333x464
- `ExperienceCard` `207:3166` — `Context=Catalog` 320x301, `Context=Home` 315x372
- `EventCard` `207:3254` — `Context=Home` 320x377
- `EventCard/Catalog` `207:3276` — 320x377
- `VendorCard` `207:3302` — `Context=Row` 428x103, `Context=Directory` 333x379
- `OrganizerCard` `207:3347` — `Context=Tile` 207x204, `Context=Directory` 428x310
- `FeaturedHeroCard` `207:3194` — 288x494
- `FeaturedPanelCard` `207:3220` — 396x373
- `AuctionCard` `207:3235` — 315x214
- `CategoryChip` `207:3097` — 100x42
- `LoadingCard` `207:2920` — 320x178

### Navigation and layout
- `SiteHeader` `207:2936` — `State=Signed out|Signed in`, 1440x80
- `SiteFooter` `207:2977` — `Size=Full` 1440x381, `Size=Minimal` 1440x80
- `NavItem` `207:2926` — `State=Default|Active|Section`
- `Tabs` `207:2841` — `State=Active|Default`, 31h
- `Breadcrumbs` `207:2835` — 206x20
- `Pagination` `207:2852` — 246x40
- `SectionHeader` `207:2818` — `Link=Yes` 883x117, `Link=No` 720x117
- `SearchPill` `207:2933` — 300x44
- `Logo` `207:3096` — 73x40

### Feedback and overlays
- `Toast` `207:2875` — `Tone=Success` 380x64, `Tone=Error` 380x81, `Tone=Neutral` 380x64
- `DeadlineBanner` `207:2895` — 380x81
- `EmptyState` `207:2901` — `Variant=FirstUse` 320x163, `Filters` 320x130, `Gated` 320x130
- `Modal` `207:3040` — 460x244
- `ModalScrim` `207:3048` — 1440x900

The Error toast is taller than the other two (81 vs 64), so `Toast` is not a
fixed-height component.

---

## 9. Icons

All icons are 24x24.

**Custom product icons (12)** — section `207:1595`, named `Icon/Title Case`:
Search, Bell, Heart, Calendar, External link, Clock, Ticket, User, Map pin,
Star, Home, Verified.

**Phosphor icons (51)** — frame `207:3385`, named `Icon / kebab-case`:
arrow-counter-clockwise, arrow-down, arrow-up, arrow-left, arrow-right,
arrow-up-right, bell, bell-fill, bell-ringing, briefcase, buildings,
calendar-plus, caret-down, check, check-circle, circle, circle-fill,
clipboard-text, clock, clock-countdown, credit-card, device-mobile,
download-simple, envelope-simple, gavel, globe-hemisphere-east, heart,
heart-fill, hourglass-medium, laptop, list, lock-key, magnifying-glass,
map-pin, minus, music-notes, play, plus, power, shield-check, sparkle,
squares-four, star, star-fill, ticket, user, user-circle, wallet, wheelchair,
wrench, x.

The Phosphor set maps to `@phosphor-icons/react`. Screens also reference sized
instances such as `icon/arrow-right@14` and `icon/caret-down@12`, so icons are
used at 12, 13, 14, 16, 19 and 24px — the component's 24x24 frame is not the
only render size.

---

## 10. Deliberate additions

The system turned out to define focus tokens (`--border-focus`,
`--size-focus-ring`), so the focus ring is extracted, not invented. Only one
addition remains genuinely ours.

**Motion scale.** No motion tokens exist, though `Spinner`, `Skeleton`,
`Countdown` and the Hover states all imply transitions. Defined in
[theme.css](../../src/styles/theme.css): `--duration-fast` 120ms,
`--duration-normal` 200ms, `--duration-slow` 320ms, with `--ease-standard`,
`--ease-enter`, `--ease-exit`, and a `prefers-reduced-motion` fallback that
collapses all three durations to 1ms.

---

## Known gaps

The token layer is complete. What remains is per-component internal structure:
`get_design_context` has not yet been called on individual components, so
padding, auto-layout direction, gaps, and fill assignments below the frame level
are not yet captured. Component geometry is currently known as absolute
x/y/w/h from `get_metadata`, which is enough for outer dimensions and variant
APIs but not for internals. Each component's analysis artifact under
`docs/figma-artifacts/` fills this in as it is built.
