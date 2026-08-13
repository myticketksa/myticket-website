# MyTicket Design System — Specification

> Extracted from `MyTicket Design` · Figma file `MvbBN5eknD2xUD5LhUBeBS`
> Generated: August 2026

---

## Table of Contents

1. [Styling System](#1-styling-system)
2. [Component Library](#2-component-library)
3. [Typography](#3-typography)
4. [Icon System](#4-icon-system)
5. [Responsive Strategy](#5-responsive-strategy)
6. [Folder Architecture](#6-folder-architecture)
7. [Naming Conventions](#7-naming-conventions)
8. [Accessibility Requirements](#8-accessibility-requirements)
9. [Reusable Component Rules](#9-reusable-component-rules)
10. [Animation Rules](#10-animation-rules)

---

## 1. Styling System

### Variable Collection: "MyTicket"

71 design tokens in a single-mode collection, organised into semantic categories.

#### Surface Tokens

| Token                     | Hex       | RGB              |
| ------------------------- | --------- | ---------------- |
| `surface/canvas`          | `#FFF7F3` | 255, 247, 243    |
| `surface/card`            | `#FFFFFF` | 255, 255, 255    |
| `surface/footer`          | `#FFF1E9` | 255, 241, 233    |
| `surface/chip`            | `#FFF1E9` | 255, 241, 233    |
| `surface/skeleton`        | `#FFE2D0` | 255, 226, 208    |
| `surface/skeleton-alt`    | `#FFC0A0` | 255, 192, 160    |
| `surface/inverse`         | `#191008` | 25, 16, 8        |
| `surface/tint`            | `#FFF8F4` | 255, 248, 244    |
| `surface/sold`            | `#F7E9E1` | 247, 233, 225    |
| `surface/brand-wash`      | `#FFF0E9` | 255, 240, 233    |
| `surface/featured-from`   | `#FFF2EA` | 255, 242, 234    |
| `surface/featured-mid`    | `#FFE6D8` | 255, 230, 216    |
| `surface/featured-to`     | `#F4E9FF` | 244, 233, 255    |

#### Ink (Text) Tokens

| Token            | Hex       | RGB            |
| ---------------- | --------- | -------------- |
| `ink/primary`    | `#191008` | 25, 16, 8      |
| `ink/body`       | `#3A2418` | 58, 36, 24     |
| `ink/muted`      | `#6B5F58` | 107, 95, 88    |
| `ink/faint`      | `#8E8078` | 142, 128, 120  |
| `ink/inverse`    | `#FFF7F3` | 255, 247, 243  |
| `ink/disabled`   | `#C0AEA4` | 192, 174, 164  |

#### Border Tokens

| Token              | Hex       | RGB            |
| ------------------ | --------- | -------------- |
| `border/default`   | `#F3DED2` | 243, 222, 210  |
| `border/strong`    | `#F5C9B4` | 245, 201, 180  |
| `border/subtle`    | `#F7E9E1` | 247, 233, 225  |
| `border/brand`     | `#FFC8AE` | 255, 200, 174  |
| `border/featured`  | `#F7DFD3` | 247, 223, 211  |

#### Brand Tokens

| Token                  | Hex       | RGB            |
| ---------------------- | --------- | -------------- |
| `brand/primary`        | `#F25F2C` | 242, 95, 44    |
| `brand/deep`           | `#B8320F` | 184, 50, 15    |
| `brand/strong`         | `#E0451A` | 224, 69, 26    |
| `brand/light`          | `#FF9147` | 255, 145, 71   |
| `brand/link`           | `#D8431A` | 216, 67, 26    |
| `brand/hover`          | `#B8320F` | 184, 50, 15    |
| `brand/gradient-from`  | `#FF9147` | 255, 145, 71   |
| `brand/gradient-to`    | `#E0451A` | 224, 69, 26    |
| `brand/gradient-deep`  | `#C4330B` | 196, 51, 11    |

#### Partner Brand Tokens

| Token              | Hex       | RGB           |
| ------------------ | --------- | ------------- |
| `brand/tabby`      | `#70F6B5` | 112, 246, 181 |
| `brand/tabby-ink`  | `#0A2A20` | 10, 42, 32    |
| `brand/tamara`     | `#FFC7C5` | 255, 199, 197 |
| `brand/tamara-ink` | `#3A0E14` | 58, 14, 20    |
| `brand/visa`       | `#1A2B7B` | 26, 43, 123   |

#### Tier Tokens

| Token              | Hex       | RGB            |
| ------------------ | --------- | -------------- |
| `tier/vip`         | `#5A18C4` | 90, 24, 196    |
| `tier/vip-light`   | `#EEDCFF` | 238, 220, 255  |
| `tier/gold`        | `#C4330B` | 196, 51, 11    |
| `tier/gold-light`  | `#FFE2D0` | 255, 226, 208  |
| `tier/gold-ink`    | `#8A2A08` | 138, 42, 8     |
| `tier/silver-light`| `#FFF1E9` | 255, 241, 233  |
| `tier/bronze`      | `#4E6C8B` | 78, 108, 139   |
| `tier/bronze-light`| `#E5F0FC` | 229, 240, 252  |

#### Accent / Tag / Badge / Bar / Zone Tokens

| Token               | Hex       | RGB            |
| -------------------- | --------- | -------------- |
| `accent/amber`       | `#C4330B` | 196, 51, 11    |
| `accent/amber-light` | `#FFC0A0` | 255, 192, 160  |
| `tag/amber-wash`     | `#FFE2D0` | 255, 226, 208  |
| `tag/brand-ink`      | `#C4330B` | 196, 51, 11    |
| `tag/rose-wash`      | `#FDECE2` | 253, 236, 234  |
| `tag/rose-ink`       | `#B8231A` | 184, 35, 26    |
| `badge/rose-wash`    | `#FDECE2` | 253, 236, 234  |
| `badge/rose-ink`     | `#C4261B` | 196, 38, 27    |
| `bar/brand-wash`     | `#FFF0E9` | 255, 240, 233  |
| `bar/brand-line`     | `#FFC8AE` | 255, 200, 174  |
| `zone/amber-wash`    | `#FFF4EE` | 255, 244, 238  |
| `zone/brand-wash`    | `#FFF0E9` | 255, 240, 233  |

#### Spacing Tokens

| Token           | Value (px) |
| --------------- | ---------- |
| `space/2xs`     | 8          |
| `space/xs`      | 12         |
| `space/sm`      | 14         |
| `space/md`      | 18         |
| `space/lg`      | 20         |
| `space/gutter`  | 40         |
| `space/section` | 88         |

#### Radius Tokens

| Token          | Value (px) |
| -------------- | ---------- |
| `radius/sm`    | 12         |
| `radius/md`    | 14         |
| `radius/lg`    | 18         |
| `radius/xl`    | 20         |
| `radius/2xl`   | 22         |
| `radius/pill`  | 999        |

### Effect Styles

| Style            | Layers                                  |
| ---------------- | --------------------------------------- |
| `Elevation/Card` | Drop shadow (2px blur) + Drop shadow (32px blur) |

### Paint Styles

None defined — all colour management is through variables.

### Palette Direction

Warm cream/peach canvas (`#FFF7F3`), burnt-orange brand (`#F25F2C`), dark-brown ink (`#191008`).

---

## 2. Component Library

63+ components on the Design System page.

### Inputs & Controls (13)

| Component          | Variants / Notes                                        |
| ------------------ | ------------------------------------------------------- |
| `Button`           | 5 styles (Primary, Secondary, Ghost, Destructive, Icon) × 3 sizes (L, M, S) × 4 states (Default, Hover, Disabled, Loading). Props: Label (text), Show icon (bool), Icon (instance-swap). |
| `TextInput`        | 4 states: Default, Focused, Error, Disabled             |
| `Select`           | Standalone, 320 × 48                                    |
| `Textarea`         | Standalone, 320 × 92                                    |
| `SearchField`      | 3 sizes: Field, Pill, Icon                              |
| `Checkbox`         | Unchecked / Checked                                     |
| `Radio`            | Unchecked / Checked                                     |
| `Toggle`           | On / Off                                                |
| `OTPBox`           | Filled / Empty                                          |
| `OTPGroup`         | Composed from OTPBox                                    |
| `AmountInput`      | Standalone, 115 × 56                                    |
| `FieldLabel`       | Standalone label atom                                   |
| `InlineError`      | Error message companion                                 |
| `CharacterCounter` | Counter companion                                       |

### Data Display (12)

| Component        | Variants / Notes                                           |
| ---------------- | ---------------------------------------------------------- |
| `StatusBadge`    | 9 tones: BrandTint, UrgentSolid, Terminal, NeutralOutline, LiveSolid, SuccessTint, Inactive, InfoTint, DangerTint |
| `FilterChip`     | Default, Hover, Selected, Removable                        |
| `OverlayBadge`   | Ink / Success                                              |
| `CountBadge`     | Web / Mobile                                               |
| `Avatar`         | 2 sizes (28, 52) × 2 shapes (Circle, Squircle)            |
| `StarRating`     | Strip / Inline                                             |
| `PriceDisplay`   | 6 contexts: Card, Row, Total, Amount, Stat, Mobile         |
| `Countdown`      | Under1h / Over1h                                           |
| `MeterBar`       | Standalone, 200 × 6                                        |
| `AttributeTag`   | Standalone tag                                             |
| `VersionPill`    | Standalone pill                                            |
| `LanguagePill`   | Standalone pill                                            |

### Cards (10)

| Component            | Variants / Notes                          |
| -------------------- | ----------------------------------------- |
| `TalentCard`         | Catalog (320 × 430) / Home (250 × 370)   |
| `TalentCard/Directory` | Directory listing (333 × 464)           |
| `ExperienceCard`     | Catalog (320 × 301) / Home (315 × 372)   |
| `EventCard`          | Home (320 × 377)                          |
| `EventCard/Catalog`  | Catalog variant (320 × 377)               |
| `VendorCard`         | Row (428 × 103) / Directory (333 × 379)  |
| `OrganizerCard`      | Tile (207 × 204) / Directory (428 × 310) |
| `FeaturedHeroCard`   | Standalone (288 × 494)                    |
| `FeaturedPanelCard`  | Standalone (396 × 373)                    |
| `AuctionCard`        | Standalone (315 × 214)                    |

### Layout & Navigation (8)

| Component        | Variants / Notes                          |
| ---------------- | ----------------------------------------- |
| `SiteHeader`     | Signed out / Signed in (1440 × 80)       |
| `SiteFooter`     | Full (1440 × 381) / Minimal (1440 × 80)  |
| `NavItem`        | Default / Active / Section                |
| `Tabs`           | Active / Default                          |
| `Breadcrumbs`    | Standalone                                |
| `Pagination`     | Standalone (246 × 40)                     |
| `SectionHeader`  | Link=Yes / Link=No                        |
| `Logo`           | Standalone (73 × 40)                      |

### Feedback & States (6)

| Component        | Variants / Notes                          |
| ---------------- | ----------------------------------------- |
| `Toast`          | Success / Error / Neutral                 |
| `EmptyState`     | FirstUse / Filters / Gated                |
| `DeadlineBanner` | Standalone (380 × 81)                     |
| `LoadingCard`    | Standalone (320 × 178)                    |
| `Skeleton`       | Media / Line                              |
| `Spinner`        | Standalone (14 × 14)                      |

### Surfaces & Overlays (3)

| Component          | Notes                                |
| ------------------ | ------------------------------------ |
| `Modal`            | 460 × 244                           |
| `ModalScrim`       | Full-viewport overlay (1440 × 900)  |
| `ImagePlaceholder` | 3 ratios: 16×10, 1×1, 16×9          |
| `Divider`          | Divider / Border tone                |

### Data Blocks (7)

| Component       | Notes                         |
| --------------- | ----------------------------- |
| `MoneySummary`  | 312 × 175                    |
| `RatingSummary` | 312 × 163                    |
| `StatCard`      | 360 × 111                    |
| `ListRow`       | 360 × 88                     |
| `KeyValueRow`   | 312 × 18                     |
| `BulletRow`     | 312 × 42                     |
| `FacetList`     | 108 × 51                     |
| `SpecPanel`     | 360 × 142                    |
| `CategoryChip`  | 100 × 42                     |
| `SearchPill`    | 300 × 44                     |

### Specialty

| Component               | Notes                          |
| ------------------------ | ------------------------------ |
| `Button — State-card CTA`| CTA for state cards (123 × 36)|

---

## 3. Typography

### Typeface

**Manrope** — geometric sans-serif, used exclusively across the entire system.

### Type Scale

#### Display

| Style          | Size | Line Height | Weight     | Letter Spacing |
| -------------- | ---- | ----------- | ---------- | -------------- |
| Display/Slide  | 88   | 92          | ExtraBold  | -2.64          |
| Display/XL     | 56   | 64          | ExtraBold  | -1.68          |
| Display/Page   | 54   | 55          | ExtraBold  | -1.89          |
| Display/L      | 46   | 48          | ExtraBold  | -1.61          |
| Display/M      | 42   | 44          | ExtraBold  | -1.47          |
| Display/S      | 34   | 36          | ExtraBold  | -1.02          |
| Display/XS     | 30   | 33          | ExtraBold  | -0.9           |
| Display/2XS    | 26   | 28          | Bold       | -0.52          |
| Display/Card   | 25   | 28          | Bold       | -0.5           |

#### Title

| Style     | Size | Line Height | Weight   | Letter Spacing |
| --------- | ---- | ----------- | -------- | -------------- |
| Title/XL  | 19   | 23          | SemiBold | 0              |
| Title/L   | 17   | 21          | SemiBold | 0              |
| Title/M   | 16   | 22          | SemiBold | 0              |

#### Body

| Style    | Size | Line Height | Weight | Letter Spacing |
| -------- | ---- | ----------- | ------ | -------------- |
| Body/L   | 18   | 28          | Medium | 0              |
| Body/M   | 16   | 24          | Medium | 0              |
| Body/S   | 14   | 21          | Medium | 0              |
| Body/XS  | 13   | 19          | Medium | 0              |
| Body/2XS | 12   | 17          | Medium | 0              |

#### Action

| Style     | Size | Line Height | Weight   | Letter Spacing |
| --------- | ---- | ----------- | -------- | -------------- |
| Action/M  | 15   | 20          | Bold     | 0              |
| Action/S  | 14   | 20          | SemiBold | 0              |
| Action/XS | 13   | 18          | SemiBold | 0              |

#### Link

| Style  | Size | Line Height | Weight | Letter Spacing |
| ------ | ---- | ----------- | ------ | -------------- |
| Link/M | 14   | 20          | Bold   | 0              |
| Link/S | 13   | 18          | Bold   | 0              |

#### Tag

| Style | Size | Line Height | Weight | Letter Spacing |
| ----- | ---- | ----------- | ------ | -------------- |
| Tag/M | 12   | 16          | Bold   | 0              |
| Tag/S | 11   | 14          | Bold   | 0              |

#### Price

| Style    | Size | Line Height | Weight    | Letter Spacing |
| -------- | ---- | ----------- | --------- | -------------- |
| Price/XL | 26   | 30          | ExtraBold | 0              |
| Price/L  | 20   | 24          | Bold      | 0              |
| Price/M  | 18   | 22          | Bold      | 0              |

#### Specialty

| Style        | Size | Line Height | Weight    | Letter Spacing |
| ------------ | ---- | ----------- | --------- | -------------- |
| Nav/M        | 15   | 22          | SemiBold  | 0              |
| Eyebrow      | 12   | 16          | ExtraBold | +1.2           |
| Eyebrow/Wide | 13   | 16          | ExtraBold | +3.64          |
| Meta/Date    | 12   | 16          | Bold      | +0.48          |
| Logo/L       | 27   | 32          | ExtraBold | -0.54          |
| Logo/S       | 25   | 30          | ExtraBold | -0.5           |
| Medium/14    | 14   | 20          | Medium    | 0              |
| Medium/13    | 13   | 19          | Medium    | 0              |

### Weight Scale

| Weight    | Usage                              |
| --------- | ---------------------------------- |
| Medium    | Body text, descriptions            |
| SemiBold  | Titles, navigation, action labels  |
| Bold      | Cards, tags, prices, links, actions|
| ExtraBold | Display headings, eyebrows, logos  |

---

## 4. Icon System

### Custom Product Icons (12)

All 24 × 24px components, `Icon/Title Case` naming:

- `Icon/Search`
- `Icon/Bell`
- `Icon/Heart`
- `Icon/Calendar`
- `Icon/External link`
- `Icon/Clock`
- `Icon/Ticket`
- `Icon/User`
- `Icon/Map pin`
- `Icon/Star`
- `Icon/Home`
- `Icon/Verified`

### Phosphor Icon Library (51)

All 24 × 24px components, `Icon / kebab-case` naming. Includes:

`arrow-counter-clockwise`, `arrow-down`, `arrow-left`, `arrow-right`, `arrow-up`, `arrow-up-right`, `bell`, `bell-fill`, `bell-ringing`, `briefcase`, `buildings`, `calendar-plus`, `caret-down`, `check`, `check-circle`, `circle`, `circle-fill`, `clipboard-text`, `clock`, `clock-countdown`, `credit-card`, `device-mobile`, `download-simple`, `envelope-simple`, `gavel`, `globe-hemisphere-east`, `heart`, `heart-fill`, `hourglass-medium`, `laptop`, `list`, `lock-key`, `magnifying-glass`, `map-pin`, `minus`, `music-notes`, `play`, `plus`, `power`, `shield-check`, `sparkle`, `squares-four`, `star`, `star-fill`, `ticket`, `user`, `user-circle`, `wallet`, `wheelchair`, `wrench`, `x`

### Icon Usage in Components

The `Button` component exposes an `Icon` instance-swap property with 12 preferred icon values pre-configured for quick selection.

---

## 5. Responsive Strategy

### Primary Breakpoint

**Desktop-first at 1440px** — SiteHeader and SiteFooter are built at 1440px width.

### Platform Pages

| Page               | Target                 |
| ------------------ | ---------------------- |
| MyTicket Guests    | Guest-facing web       |
| MyTicket business  | Business/admin dashboard |
| MyTicket Mobile App| Native mobile app      |

### Responsive Patterns

- **Spacing tokens** provide breakpoint-ready values: `space/gutter` (40px) for column gaps, `space/section` (88px) for vertical rhythm
- **Platform-aware variants:** `CountBadge` has `Platform=Web` / `Platform=Mobile` variants
- **Context-driven adaptation:** Cards use `Context` variants (Home, Catalog, Directory, Row) to adapt density per viewport rather than explicit breakpoints
- **No global grid styles defined** — responsiveness is component-level, not grid-level

### Layout Approach

- 63% of nodes use auto-layout (655 auto-layout vs 387 fixed)
- SiteHeader uses `HORIZONTAL` auto-layout at root level
- Components are generally self-contained with internal auto-layout

---

## 6. Folder Architecture

### Page Structure

| Page               | Purpose                                    | Contents         |
| ------------------ | ------------------------------------------ | ---------------- |
| Showcase           | 8-slide pitch/presentation deck            | 8 frames (1920 × 1080) |
| MyTicket Guests    | Guest-facing web screens                   | Empty            |
| MyTicket business  | Business/admin screens                     | Empty            |
| MyTicket Mobile App| Mobile app screens                         | Empty            |
| Design System      | Components, icons, foundation docs         | 5 sections + 60+ components |

### Design System Page Organisation

| Section                                    | Contents                                   |
| ------------------------------------------ | ------------------------------------------ |
| `MyTicket — Icons`                         | 12 custom icon components                  |
| Components (loose on page)                 | 60+ components and component sets          |
| `00 · Cover`                               | Design system cover/title card             |
| `01 · Foundations — Colour`                | Colour documentation frame                 |
| `02 · Foundations — Typography`            | Typography documentation frame             |
| `03 · Foundations — Shape, Elevation & Icons` | Shape, shadow, and icon documentation   |
| `Icons — Phosphor`                         | 51 Phosphor icon components                |

### Showcase Deck Structure

1. `01 — Cover`
2. `02 — The platform`
3. `03 — Channels`
4. `04 — Wireframe stage`
5. `05 — Booking flow`
6. `06 — Home, annotated` (extended height: 1920 × 4800)
7. `07 — In context`
8. `08 — Thank you`

---

## 7. Naming Conventions

### Variables

**Pattern:** `category/semantic-name` (slash-separated, lowercase)

| Category  | Examples                                          |
| --------- | ------------------------------------------------- |
| `surface/`| `surface/canvas`, `surface/card`, `surface/inverse` |
| `ink/`    | `ink/primary`, `ink/muted`, `ink/disabled`         |
| `border/` | `border/default`, `border/strong`, `border/brand`  |
| `brand/`  | `brand/primary`, `brand/deep`, `brand/link`        |
| `tier/`   | `tier/vip`, `tier/gold`, `tier/bronze`             |
| `accent/` | `accent/amber`, `accent/amber-light`               |
| `tag/`    | `tag/amber-wash`, `tag/rose-ink`                   |
| `badge/`  | `badge/rose-wash`, `badge/rose-ink`                |
| `bar/`    | `bar/brand-wash`, `bar/brand-line`                 |
| `zone/`   | `zone/amber-wash`, `zone/brand-wash`               |
| `space/`  | `space/xs`, `space/gutter`, `space/section`        |
| `radius/` | `radius/sm`, `radius/pill`                         |

### Text Styles

**Pattern:** `Role/Size`

Examples: `Display/XL`, `Body/M`, `Action/S`, `Price/L`, `Tag/M`, `Eyebrow/Wide`, `Meta/Date`

### Components

**Pattern:** PascalCase

Examples: `SiteHeader`, `FilterChip`, `StatusBadge`, `TalentCard`, `ImagePlaceholder`

### Sub-Components

**Pattern:** `Parent/Context`

Examples: `TalentCard/Directory`, `EventCard/Catalog`

### Variant Properties

**Pattern:** `Property=Value` with PascalCase values

| Property   | Example Values                                      |
| ---------- | --------------------------------------------------- |
| `Style`    | Primary, Secondary, Ghost, Destructive, Icon        |
| `Size`     | L, M, S                                             |
| `State`    | Default, Hover, Disabled, Loading, Focused, Error   |
| `Tone`     | BrandTint, UrgentSolid, Terminal, SuccessTint       |
| `Context`  | Home, Catalog, Directory, Row, Tile                 |
| `Variant`  | FirstUse, Filters, Gated                            |
| `Urgency`  | Under1h, Over1h                                     |
| `Platform` | Web, Mobile                                         |
| `Form`     | Strip, Inline                                       |
| `Ratio`    | 16x10, 1x1, 16x9                                   |
| `Shape`    | Circle, Squircle                                    |
| `Link`     | Yes, No                                             |

### Icons

| Set      | Pattern                  | Example                     |
| -------- | ------------------------ | --------------------------- |
| Custom   | `Icon/Title Case`        | `Icon/Map pin`              |
| Phosphor | `Icon / kebab-case`      | `Icon / arrow-up-right`     |

### Foundation Sections

**Pattern:** `NN · Title — Subtitle`

Examples: `00 · Cover`, `01 · Foundations — Colour`, `03 · Foundations — Shape, Elevation & Icons`

### Showcase Slides

**Pattern:** `NN — Title`

Examples: `01 — Cover`, `04 — Wireframe stage`, `06 — Home, annotated`

---

## 8. Accessibility Requirements

### What's Built In

- **Disabled state token:** `ink/disabled` (`#C0AEA4`) for communicating non-interactive states
- **Semantic status tones:** `StatusBadge` has 9 tones (BrandTint, UrgentSolid, Terminal, LiveSolid, SuccessTint, DangerTint, InfoTint, Inactive, NeutralOutline) — state is conveyed beyond colour alone
- **Accessibility icon:** Dedicated `Icon / wheelchair` component in the Phosphor set
- **Input error states:** `TextInput` has explicit Error and Disabled states with `InlineError` companion component for inline validation messaging
- **Feedback tones:** `Toast` provides distinct tones for Success, Error, and Neutral

### Gaps & Considerations

- **No dark mode:** Single-mode variable collection — no light/dark theme switching
- **Contrast to verify:** Brand orange (`#F25F2C`) on cream canvas (`#FFF7F3`) should be tested at small sizes for WCAG AA compliance
- **No focus-ring styles:** No explicit focus indicator styles are defined in the system
- **No ARIA documentation:** No annotation or documentation layer for accessibility attributes

---

## 9. Reusable Component Rules

### Variant Axis Conventions

| Axis       | Purpose                                    | Common Values                            |
| ---------- | ------------------------------------------ | ---------------------------------------- |
| `Style`    | Visual variant / hierarchy                 | Primary, Secondary, Ghost, Destructive   |
| `Size`     | Dimensional scale                          | L, M, S (or specific px like 28, 52)    |
| `State`    | Interactive state                          | Default, Hover, Disabled, Loading, Focused, Error |
| `Tone`     | Semantic colour intent                     | BrandTint, UrgentSolid, SuccessTint, DangerTint |
| `Context`  | Usage location / viewport density          | Home, Catalog, Directory, Row, Tile      |

### Component Property Patterns

- **Boolean toggles** for optional slots (e.g. `Show icon` on Button)
- **Instance-swap props** with preferred values for icon slots (12 pre-configured)
- **Text props** for editable labels (e.g. `Label` on Button)
- **Variant props** for multi-axis configuration

### Design Principles Observed

1. **Context over breakpoints:** Cards adapt via `Context` variants (Home, Catalog, Directory) rather than viewport-based breakpoints
2. **Companion atoms:** Form fields are composed from separate atoms — `FieldLabel`, `InlineError`, `CharacterCounter` sit alongside `TextInput` / `Select` / `Textarea`
3. **Composite components:** Higher-order components compose lower-order ones — `OTPGroup` uses `OTPBox`, `SiteHeader` uses `NavItem` + `SearchField` + `Logo` + `Avatar`
4. **Auto-layout first:** 63% of nodes use auto-layout for internal structure
5. **Semantic pairing:** Colour tokens come in `wash` + `ink` pairs (e.g. `tag/rose-wash` + `tag/rose-ink`) for consistent surface/text combinations
6. **Single effect style:** All card elevation shares one `Elevation/Card` style (2px + 32px shadow)

---

## 10. Animation Rules

### Current State

No explicit animation tokens, motion styles, or transition specifications are defined in the design system.

### Implied Motion Patterns

| Pattern                  | Evidence                                      |
| ------------------------ | --------------------------------------------- |
| State transitions        | Button, TextInput, FilterChip, Toggle all have interactive states (Default → Hover → Disabled) implying transitions |
| Loading animation        | `Spinner` component and Button `Loading` state suggest rotation/pulse animations |
| Skeleton loading         | `Skeleton` component (Media / Line variants) implies shimmer or pulse animation |
| Countdown                | `Countdown` component (Under1h / Over1h) implies ticking/updating text |

### Recommendations

Motion primitives to define:

- **Duration scale:** e.g. `duration/fast` (100ms), `duration/normal` (200ms), `duration/slow` (300ms)
- **Easing curves:** e.g. `ease/default`, `ease/enter`, `ease/exit`
- **Transition types:** State transitions, loading pulses, skeleton shimmer, enter/exit
- **Reduced motion:** Prefers-reduced-motion fallbacks

---

## Appendix: File Metadata

| Field            | Value                                     |
| ---------------- | ----------------------------------------- |
| File key         | `MvbBN5eknD2xUD5LhUBeBS`                 |
| Pages            | 5                                         |
| Variable tokens  | 71                                        |
| Text styles      | 36                                        |
| Effect styles    | 1                                         |
| Component sets   | 28                                        |
| Components       | 93 (standalone)                           |
| Custom icons     | 12                                        |
| Phosphor icons   | 51                                        |
| Typeface         | Manrope (single family)                   |
| Primary width    | 1440px (desktop)                          |
| Brand colour     | `#F25F2C` (burnt orange)                  |
