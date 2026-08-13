# Feedback & overlays — Figma artifact

Source file `yffYsbbooJbCZMYbAWSMfH`. Built to `src/components/feedback/`.

---

## Toast — `207:2875`

One shell, three tones (Success, Error, Neutral). Radius 16, padding 14×18, 1px border,
22×22 badge. Success tick is Phosphor `Check` at 12 — Figma's description called it a
literal ✓; the drawing is a vector. The `!` on Error is a real text glyph. Neutral is
derived (no badge); treat as provisional. Max-width 380. No dismiss ×. Placement / 5s
self-dismiss / stack gap belong to an unbuilt toast viewport.

## EmptyState — `207:2901`

Variants: FirstUse (heart medallion + cardCta), Filters (local secondary S — Button has
no Secondary×S pair), Gated (cardCta, no medallion). Heart is Phosphor regular at 19, not
the custom `HeartIcon`. Max-width 320. CTA always required. No Failed variant drawn.

## DeadlineBanner — `207:2895`

Toast shell on `--bg-tint-brand`. Timer drawn locally: **15px/800 `--ink-brand-strong`**
for an over-one-hour value — contradicts `Countdown`'s 12px/700 / muted rule on size,
weight and colour, in the direction of *more* urgency. Atom left untouched. Third site
breaking that rule after AuctionCard. ⏳ is a literal emoji as drawn.

## Modal — `207:3040` + scrim `207:3048`

460 max-width, `--radius-panel`, 26px padding, `shadow-overlay`. Scrim:
`--surface-inverse` at 55% + 1.5px backdrop blur. Title is `Heading/H3`. Actions are
Button M (destructive above ghost) — export resolved both to h42/r21, not the h46/h40 the
notes described. Built on Radix Dialog (focus trap, Escape, scrim click, focus restore).
No ×, no header divider, no scroll region.

---

## Open decisions

1. **Countdown rule** — now broken by AuctionCard, DeadlineBanner, and (documented)
   possibly others. Needs a design call.
2. **Radius 16** — Toast, DeadlineBanner, EventCard all hard-code it; scale jumps 14 → 18.
3. **No toast viewport** for bottom-left / 5s / 14px stack.
4. **No Secondary × Size=S** on Button — EmptyState Filters CTA stays local.
