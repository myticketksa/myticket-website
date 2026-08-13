# Artifact — Button

Figma node `207:1630`. 18 variants across `Style × Size × State`.

Figma description: *"DS-COMPONENTS A1. Radius = height/2. Only the Style x Size
pairs the source draws are built; Hover comes from style-hover
(Secondary/Ghost/Destructive/Icon) and from prose for Primary (C9). Disabled and
Loading are drawn at Primary M only."*

## Sizes

Radius is exactly height/2, so buttons are true pills.

| Size | Height | px | Radius | Font size | Weight |
| --- | --- | --- | --- | --- | --- |
| L | 48 | 24 | 24 | 15 | **Bold 700** |
| M | 42 | 18 | 21 | 14 | SemiBold 600 |
| S | 36 | 15 | 18 | 13 | SemiBold 600 |

Size L is the only size set in Bold. Gap between icon and label is
`--space-control-gap` (9) at every size, centred both axes.

## Styles

| Style | Fill | Border | Label |
| --- | --- | --- | --- |
| Primary | brand gradient | none | `--ink-inverse` |
| Primary · Hover | flat `--brand-primary` | none | `--ink-inverse` |
| Secondary | `--surface-default` | 1.5px `--border-default` | `--ink-primary` |
| Secondary · Hover | `--surface-default` | 1.5px `--border-brand` | `--ink-brand` |
| Ghost | none | none | `--ink-secondary` |
| Ghost · Hover | none | none | `--ink-brand` |
| Destructive | `--surface-default` | **1px** `--border-danger` | `--state-danger` |
| Destructive · Hover | `--state-danger-tint` | 1px `--border-danger` | `--state-danger` |
| Icon | `--surface-default` | 1.5px `--border-default` | — |
| Icon · Hover | `--surface-default` | 1.5px `--border-brand` | — |

Two details worth not smoothing over:

**Primary's hover drops the gradient for a flat fill.** It is not a darkened
gradient, so the implementation sets `hover:bg-none hover:bg-brand-primary`.

**Destructive is the only style with a 1px border**; every other bordered style
uses 1.5px (`--size-border-interactive`). Verified across both its variants.

## States

- **Disabled** — fill `--bg-skeleton`, label `--ink-disabled`, no border, no
  gradient. Drawn at Primary M only.
- **Loading** — gradient retained at `opacity 0.75`, with a 14px spinner
  inserted before the label. Drawn at Primary M only. The drawn frame is 92 wide
  against 69 for Default, i.e. the spinner widens the button rather than
  replacing the label.

## Icon slot

The generic icon layer is **18px**. `Secondary M Default` instead carries an
`icon/heart@16` instance at 16px, which is also what `SiteHeader`'s Sign in
button uses. So the icon size is per-usage, not fixed by the button; the
component takes an already-sized node.

`Style=Icon` is square — 42×42 at M — with the horizontal padding dropped.

## Gradient angle

Figma reports a different angle on each Primary instance: 133.49°, 134.37°,
135.30°, 141.67°. These are not four design decisions. Figma stores a gradient
as a transform over the layer's bounding box, so the reported angle drifts with
the frame's aspect ratio. The intent is a 135° diagonal, which is what
`--gradient-brand` uses.

`SiteHeader`'s Create account button reports 152.54° for the same reason — a
wider, shorter box.

## New tokens surfaced

None of these appear in the three Foundations frames:

`--size-btn-lg` 48, `--size-btn-md` 42, `--size-btn-sm` 36,
`--space-btn-pad-lg` 24, `--space-btn-pad-md` 18, `--space-btn-pad-sm` 15,
`--radius-btn-lg` 24, `--radius-btn-md` 21, `--radius-btn-sm` 18,
`--border-brand` `#f25f2c`, `--border-danger` `#dc3a2a`.

## Implementation notes

`src/components/ui/Button.tsx`.

Figma builds only the `Style × Size` pairs the source screens draw, which is a
variant-explosion constraint in Figma rather than a rule about which
combinations are legal. In CSS, style and size are orthogonal — size sets height,
padding, radius and type; style sets fill, border and label colour — so the
component exposes all 15 combinations. The table above is the design-verified
subset; anything outside it is a composition, not a new design.

`Disabled` and `Loading` are modelled as boolean props rather than a `state`
union, because they are real DOM states (`disabled`, `aria-busy`) and Hover
belongs to CSS, not to a prop.

Tailwind's `h-*` and `w-*` utilities read the `--spacing-*` namespace, so the
control heights are registered there as `--spacing-btn-*`. Figma's `size/btn-*`
names are preserved in `tokens.json`.
