import { Dialog as DialogPrimitive } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

/**
 * Figma `ModalScrim` — node 207:3048.
 *
 * `--surface-inverse` at 55% with a background blur, no radius and no padding. Figma
 * notes that the specimen's 20 radius and 36 padding belong to the documentation frame
 * that holds the scrim, not to the scrim, so neither is reproduced, and that the drawn
 * 1440×900 is a viewport-sized display size rather than a token — `fixed inset-0` is
 * the web equivalent.
 *
 * **Two numbers had to be reconciled.**
 *
 * The blur is the easy one. The export says `backdrop-blur-[1.5px]` and both the
 * attached `Blur/Scrim` effect style and the prose say 3px; those are the same thing,
 * because Figma's blur radius is twice the CSS standard deviation. 1.5px is the value
 * that belongs in CSS.
 *
 * The alpha is the awkward one, and it is the one place in this set where the exported
 * class is not taken at face value. The export emits an opaque
 * `bg-[var(--surface-inverse,#191008)]`, while the description says
 * `rgba(25,16,8,0.55)` and explains that the alpha lives on the *paint* and is
 * deliberately never baked into a colour variable. That is precisely the shape Figma's
 * codegen cannot serialise: it can emit the variable binding or a literal `rgba`, not
 * both, and it chose the binding. The drawing itself settles it — the same export
 * carries a background blur, and a background blur has nothing to blur behind a fully
 * opaque fill, so the fill must be translucent for the drawn effect to mean anything.
 * 55% is used, and the token binding is kept via Tailwind's opacity modifier so the
 * alpha stays on the paint rather than becoming a new colour.
 *
 * Deliberate addition: `z-50`, matching the z-index the project's existing dialog
 * wrapper uses, since stacking order is not something Figma expresses.
 */
export function ModalScrim({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('fixed inset-0 z-50 bg-surface-inverse/55 backdrop-blur-[1.5px]', className)}
      {...props}
    />
  )
}

/**
 * Figma `Modal` — node 207:3040, over `ModalScrim` `207:3048`.
 *
 * A 460-wide panel on `--bg-page` at `--radius-panel` (22) with 26px of padding, no
 * border, and the `Elevation/Overlay` shadow. Inside, three stacked full-width rows:
 * a title row with 6px beneath it, a body row with 20px beneath it, and an actions
 * column at a 10px gap with the destructive action **above** the dismissive one. The
 * 26px padding, the 6px and the 10px gap are bare literals in the export; the 20px is
 * a `--space-xl` binding and is mapped as one.
 *
 * Type: the title is `Heading/H3` exactly — 24px/800, 1.15, −0.48px tracking — so the
 * `text-heading-h3` utility is reused rather than written out. The body is 14px/500 at
 * 1.55 in `--ink-secondary`, which is *not* `Body/Default` (15px at the same weight and
 * leading), so it is written out.
 *
 * **Four conflicts, all resolved toward the drawing.**
 *
 * The width: Figma's prose says 460–560 and the specimen draws 400. Figma resolved this
 * in the file itself and drew 460 — the low end of the stated range — so 460 is what
 * is built. The title size: the specimen drew 21px, the `Heading/H3` token says 24, and
 * the file resolved it to the token, which the export confirms at 24px. The action
 * heights: Figma's O3 notes describe the destructive at h46 r23 in 14.5px/700 and the
 * ghost at h40 in 14px/500, but the `Button` set only builds 48/42/36 and the export
 * lands both at h42, r21, 14px/600 — which is Button M exactly, for both styles. The
 * drawing wins, so these are real `Button` instances at `size="md"` rather than a
 * fourth height forked for 4px.
 *
 * The shadow is the fourth, and it is the same serialisation problem as the scrim's
 * alpha. The export writes `drop-shadow-[0px_40px_40px_rgba(25,16,8,0.6)]` while the
 * attached effect style reads offset (0, 40), radius 80, spread −30 at
 * `#19100899` — which is `--shadow-overlay` to the digit. Tailwind's `drop-shadow-[…]`
 * arbitrary value has no spread slot, so the codegen dropped the spread and halved the
 * blur to compensate. The effect style is the drawn value, so `shadow-overlay` is used.
 *
 * **Not built:** a close (×) button, a header divider and a scroll region. Figma states
 * there are none of the three. No second size, tone or dismissible variant exists
 * either, and the actions are a fixed pair rather than a free slot, because that is the
 * only arrangement drawn.
 *
 * **Behaviour is a deliberate addition, because Figma cannot draw it.** This is built
 * on the Radix Dialog primitive, which supplies the focus trap, Escape to close, scrim
 * click to close and focus restoration to the trigger on close. The project's
 * `ui/dialog.tsx` is untouched stock shadcn — it styles itself with `bg-background`,
 * `rounded-lg`, `ring-ring` and `animate-in`, none of which exist in this theme — so
 * the primitive is wrapped here directly rather than restyled through that file. The
 * title and body are wired to Radix's `Title` and `Description`, which gives the dialog
 * its accessible name and description for free; the dismissive action is a
 * `Dialog.Close` so keyboard and pointer users get the same result as Escape.
 *
 * Two smaller additions: the panel is fixed and centred, since Figma draws it centred
 * inside the scrim but a scrim is not a layout parent; and the drawn 460 is a
 * **max**-width over `w-full`, because a rigid 460 would overflow every phone. No
 * responsive gutter is added beside it — none is drawn, so at narrow widths the panel
 * simply fills the viewport and keeps its 26px padding.
 */
export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  body: ReactNode
  /** The destructive action. Drawn above the dismissive one, and does not self-close. */
  confirmLabel: ReactNode
  onConfirm?: () => void
  /** The dismissive action. Closes the modal, as Escape and a scrim click do. */
  cancelLabel: ReactNode
  onCancel?: () => void
  className?: string
}

export function Modal({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  onConfirm,
  cancelLabel,
  onCancel,
  className,
}: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay asChild>
          <ModalScrim />
        </DialogPrimitive.Overlay>

        <DialogPrimitive.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex w-full max-w-[460px] -translate-x-1/2 -translate-y-1/2 flex-col items-start rounded-panel bg-bg-page p-[26px] shadow-overlay',
            className,
          )}
        >
          <div className="flex w-full flex-col items-start overflow-clip pb-[6px]">
            <DialogPrimitive.Title className="w-full text-heading-h3 text-ink-primary">
              {title}
            </DialogPrimitive.Title>
          </div>

          <div className="flex w-full flex-col items-start overflow-clip pb-xl">
            <DialogPrimitive.Description className="w-full text-[14px] leading-[1.55] font-medium text-ink-secondary">
              {body}
            </DialogPrimitive.Description>
          </div>

          <div className="flex w-full flex-col items-start gap-[10px] overflow-clip">
            <Button variant="destructive" size="md" onClick={onConfirm} className="w-full">
              {confirmLabel}
            </Button>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="md" onClick={onCancel} className="w-full">
                {cancelLabel}
              </Button>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
