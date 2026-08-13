# Artifact — Icon layer

Figma section `207:1595` "MyTicket — Icons" plus the Phosphor set at `207:3385`.

## The twelve first-party glyphs

All twelve are 24×24 component symbols on a 24 grid, matching `--size-icon-lg`.

| Figma | Node | Component |
| --- | --- | --- |
| Icon/Search | `207:1596` | `SearchIcon` |
| Icon/Bell | `207:1599` | `BellIcon` |
| Icon/Heart | `207:1602` | `HeartIcon` |
| Icon/Calendar | `207:1604` | `CalendarIcon` |
| Icon/External link | `207:1607` | `ExternalLinkIcon` |
| Icon/Clock | `207:1611` | `ClockIcon` |
| Icon/Ticket | `207:1614` | `TicketIcon` |
| Icon/User | `207:1617` | `UserIcon` |
| Icon/Map pin | `207:1620` | `MapPinIcon` |
| Icon/Star | `207:1623` | `StarIcon` |
| Icon/Home | `207:1625` | `HomeIcon` |
| Icon/Verified | `207:1627` | `VerifiedIcon` |

## Drawing convention

Eleven are single-colour strokes: `stroke-width 2`, `stroke-linecap round`,
`stroke-linejoin round`, `fill none`, ink `#191008`. That ink is rebound to
`currentColor`, so an icon inherits the text colour of its container and needs no
colour prop.

`Verified` is the exception — a two-tone badge, a brand-filled star behind a
white check. It keeps explicit fills, bound to `var(--color-brand-primary)` and
`var(--color-surface-default)` rather than raw hex.

## How the geometry got here

Per the design-to-code rules, icon geometry is never hand-authored. Each symbol
was pulled with `download_assets` at `defaultFormat: svg`, which returns the
symbol *together with the chrome of the section it sits in* — a `#F5F5F5` backing
rect and the section's own rounded-rect border, with coordinates running negative
(`M-56 -54…`). The real glyph is the `<g id="Icon/Name">` subtree.

`scripts/build-icons.mjs` lifts that subtree out with a brace-matching walk,
rebinds the colours, rewrites `src/assets/icons/*.svg` to the glyph alone, and
generates one component per icon plus a barrel. It is idempotent: on a second run
there is no `Icon/` wrapper left to find, so it falls back to treating the whole
`<svg>` body as the glyph. Re-run with `npm run build:icons`.

The committed path data is Figma's own, not redrawn.

## Sizing

`size` defaults to 24 and sets both width and height, so an icon can never
inflate to its intrinsic size. The design instantiates glyphs at 24, 16
(`--size-icon-sm`), and — inside specific components — 15, 14 and 13. Those
off-scale sizes are real: the header search glyph is 15, the Sign in button's
heart is 16, `arrow-left` in the purchase header is 14, and the checkout
assurance checks are 13.

## Phosphor stand-ins

The screens reference far more glyphs than the twelve drawn. Figma's icon page
names Phosphor as the source, so `phosphor.ts` re-exports roughly fifty aliased
under the same `*Icon` naming (`CaretDown` → `ChevronDownIcon`). Weight
`regular` is closest to the custom set's 2px stroke on a 24 grid.

Routing them through one module means promoting any of them to a first-party
glyph later is a one-line change rather than an edit across every screen.

## Note on glyphs that are text, not icons

The `SearchPill` description warns that its magnifier is the literal `⌕`
character (U+2315) rendered as text, not `Icon/Search`. The exported header asset
is nonetheless a real vector, so `SearchIcon` at 15 is the faithful build. Watch
for the same pattern elsewhere: a "missing" icon may be a typographic character.
