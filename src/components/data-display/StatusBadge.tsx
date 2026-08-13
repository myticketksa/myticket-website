import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `StatusBadge` — node 207:1750.
 *
 * From the Figma description: *"The status taxonomy is fixed — every state in the
 * product maps to exactly one badge, so colour always means the same thing."*
 *
 * All 25 labels in the source are geometrically identical — 12px/700, 4×10
 * padding, radius 10 — and collapse to these nine paint recipes. So the variant
 * axis is the recipe and the label is free text.
 *
 * Read-only by design. For interactive pills use `FilterChip`.
 */
const badge = cva(
  'inline-flex items-center justify-center rounded-badge px-[10px] py-xs text-label-badge',
  {
    variants: {
      tone: {
        brandTint: 'bg-bg-tint-brand text-ink-brand-strong',
        urgentSolid: 'bg-brand-identity-end text-ink-inverse',
        // Terminal's label is --bg-page, not --ink-inverse. Warm off-white on
        // near-black rather than pure white.
        terminal: 'bg-surface-inverse text-bg-page',
        neutralOutline: 'border border-border-default bg-bg-page text-ink-secondary',
        liveSolid: 'bg-state-success text-ink-inverse',
        successTint: 'bg-state-success-tint text-state-success',
        inactive: 'bg-state-inactive text-state-inactive-ink',
        infoTint: 'bg-state-info-tint text-state-info',
        dangerTint: 'border border-state-danger-border bg-state-danger-tint text-state-danger-deep',
      },
    },
    defaultVariants: { tone: 'brandTint' },
  },
)

export type StatusTone = NonNullable<VariantProps<typeof badge>['tone']>

/**
 * The 25 labels the source draws, mapped to their recipe. Useful as the single
 * place status strings are bound to a tone, so a label can never drift onto the
 * wrong colour.
 *
 * `✓ Verified` and `● Available` carry literal text glyphs, not icons.
 */
export const STATUS_TONES: Record<string, StatusTone> = {
  'On sale': 'brandTint',
  'Listed for resale': 'brandTint',
  Gift: 'brandTint',
  'claim by Fri': 'brandTint',
  '✓ Verified': 'brandTint',
  'Under review': 'brandTint',
  'Nearly sold out': 'urgentSolid',
  'Action needed': 'urgentSolid',
  'Sold out': 'terminal',
  'Sales open 12 Oct': 'neutralOutline',
  'Free seating': 'neutralOutline',
  Travels: 'neutralOutline',
  'Awaiting response': 'neutralOutline',
  'Live now': 'liveSolid',
  Valid: 'successTint',
  '● Available': 'successTint',
  Accepted: 'successTint',
  Completed: 'successTint',
  Used: 'inactive',
  Reserved: 'inactive',
  Expired: 'inactive',
  Withdrawn: 'inactive',
  Refunded: 'infoTint',
  'New on MyTicket': 'infoTint',
  Cancelled: 'dangerTint',
  Declined: 'dangerTint',
}

export interface StatusBadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {}

export function StatusBadge({ className, tone, children, ...props }: StatusBadgeProps) {
  return (
    <span className={cn(badge({ tone }), className)} {...props}>
      {children}
    </span>
  )
}
