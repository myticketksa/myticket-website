# Artifact — UI primitives

Every value below is an exact Figma value. `Button` has its own artifact.

## Shared field box

`TextInput`, `Select` and `Textarea` sit on one box: `--radius-input` (12),
`--space-field-pad` (14) horizontal, a 1px `--border-default` at rest,
`--surface-default` fill.

Focus and error both thicken the border to 1.5px
(`--size-border-interactive`), which means the box grows inward by half a pixel
per side on focus. That is the design as drawn; compensating for it would nudge
the text.

## TextInput — `207:1689`

h48 (`--size-input`), 15px/1.55 (Body/Default).

| State | Fill | Border | Text |
| --- | --- | --- | --- |
| Default | `--surface-default` | 1px `--border-default` | `--ink-muted` (placeholder) |
| Focused | `--surface-default` | 1.5px `--border-focus` | — |
| Error | `--state-danger-tint` | 1.5px `--border-danger` | — |
| Disabled | `--bg-skeleton` | 1px `--border-default` | `--ink-disabled` |

Two inferences, both flagged by Figma itself:

- **Disabled is not drawn.** Figma's description says it is inferred from the
  documented disabled fill and text, and that *"its border is unspecified and
  repeats the default"*.
- **No filled state is drawn.** Every variant shows placeholder text at
  `--ink-muted`, so the entered-value colour is not given. `--ink-primary` is
  used, consistent with `Select`, which does show a real value.

## Select — `207:1698`

The same box as TextInput, text in `--ink-primary` because it shows a chosen
value.

**No chevron.** The source draws none and the description confirms the omission
is deliberate. `appearance-none` is needed so the browser does not add one back.

## Textarea — `207:1700`

`min-height` 92, padding 12/14, radius 12, 1px border, **14px/1.5** — a step
down from TextInput's 15px/1.55.

Figma nests the character counter inside the text node but the description says
to build it as a sibling, so it is not composed in; `Field` places it.

## SearchField — `207:1708`

Three sizes, all on a 1.5px `--border-default`.

| Size | Box | Radius | Padding | Gap | Text | Glyph |
| --- | --- | --- | --- | --- | --- | --- |
| Field | h44 | 22 | 16 | 9 | 14px | 15 |
| Pill | h38 | 19 | 14 | 8 | 13px | 13 |
| Icon | 34×34 | 17 | — | — | — | 13 |

`Pill` sits on a **transparent** ground; the other two fill with
`--surface-default`. Standalone width for Field and Pill is 240.

This overlaps `SearchPill` (`207:2933`) in the header, which has identical paint
and Field metrics but flexes between 200 and 300 instead of being fixed at 240.
Both are kept — see LAYOUT-ARCHITECTURE.md.

## Checkbox — `207:1717`

16×16 box, `--space-row-gap` (10) to the label, label 14px `--ink-primary`,
trailing count 13px `--ink-muted`.

- Unchecked: `--surface-default`, 1px `--border-default`
- Checked: `--brand-primary` fill, 12px check glyph

**Corners are square.** Figma's description is explicit that the source uses a
native input whose radius was never specified, so it is left at 0 rather than
rounded on a guess.

The count is pushed right with `margin-left: auto`, which needs a full-width row
— the drawn component hugs, so that is the `fullWidth` prop.

## Radio — `207:1727`

Identical row geometry to Checkbox: 16×16 control, gap 10, 14px label, no count.

Checked is a **solid brand disc**, not a ring with an inner dot. The description
calls this out because the native radio's dot is browser-drawn and unspecified.

## Toggle — `207:1734`

Track 44×26, knob 20×20 inset 3, row gap `--space-md` (12).

- **ON** — `--gradient-identity`, a **two-stop** ramp `#ff9147 → #e0451a` with no
  mid stop. Not `--gradient-brand`, which is three stops ending on `#d8431a`.
- **OFF** — track filled with `--border-default`, i.e. a border colour used as a
  fill.

The label changes with state too: `--ink-primary` on, `--ink-secondary` off.

Radii read as 13 and 10 but are bound to `--radius-pill` (999); the pill rule
clamps to exactly half the height. Knob shadow and a disabled state are not
specified.

## OTPBox — `207:1743`

48×56 (`--size-otp-w` / `--size-otp-h`), radius 12.

- Empty: 1px `--border-default`, no content — so Empty has no digit property
- Filled: 1.5px `--border-brand`, digit centred at **22px/700**

That 22/700 is set directly and does **not** match `Numeric/Default` (22/600).
Figma flags the mismatch, so the heavier weight is deliberate.

Error is not drawn; `invalid` reuses TextInput's danger border and tint rather
than inventing a treatment.

## AmountInput — `207:1747`

h56 (`--size-amount-input`), px16, gap 12, `--radius-control` (14), 1.5px
`--border-brand`.

Prefix 15/600 `--ink-secondary`; value `Numeric/Default` (22/600, tabular).

Only one state is drawn, and it already carries the brand border every other
field reserves for focus. The description calls it "focused-looking" and notes
there is no default or error variant — so the brand border is the **resting**
appearance here. No width is declared, so it hugs.

## FieldLabel, InlineError, CharacterCounter

| Component | Node | Type | Colour |
| --- | --- | --- | --- |
| FieldLabel | `207:1702` | Label/Field 13/600 | `--ink-primary` |
| InlineError | `207:1704` | Label/Error 12.5/600 | `--state-danger` |
| CharacterCounter | `207:1706` | 12px/500 | `--ink-muted` |

CharacterCounter's 12px matches no named text style and its weight is
unspecified, so it takes the body weight of 500.

All three hug, and Figma states their spacing belongs to the parent: FieldLabel's
7px bottom margin, InlineError's 6px top margin, CharacterCounter's right
alignment. The `Field` wrapper is that parent, so those three values live in one
place.

## Implementation notes

`Checkbox`, `Radio` and `Toggle` wrap Radix (`react-checkbox`,
`react-radio-group`, `react-switch`) for keyboard behaviour and ARIA, with all
default styling replaced. The shadcn wrappers for radio-group and switch were
deleted, since these components consume the Radix primitives directly.

`TextInput`'s affix props are named `leading` and `trailing`, not
`prefix`/`suffix`: `prefix` is a real HTML attribute typed `string`, so a
ReactNode cannot widen it.

`OTPInput` implements the group (`207:2868`) rather than a single box, since
per-digit focus advance, backspace-to-previous, arrow navigation and
paste-to-fill only make sense at the group level.
