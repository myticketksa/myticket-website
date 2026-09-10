import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRightIcon, CheckGlyphIcon, MinusIcon, PlusIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

export interface TicketTier {
  name: string
  detail: string
  price: string
  left: string
  maxLabel?: string
  /** Paint the left count in brand-gradient-end (low stock). */
  urgent?: boolean
  selected?: boolean
  qty?: number
  soldOutRail?: { note: string; cta: string; to?: string }
}

export interface StickyCtaTotalLine {
  label: string
  value: string
}

export interface StickyCtaCardProps {
  fromLabel?: string
  fromPrice: string
  note?: string
  tiers?: TicketTier[]
  totals?: StickyCtaTotalLine[]
  total?: string
  primaryLabel?: string
  /** Route for the primary CTA (e.g. event seats). Uses navigate when set. */
  primaryTo?: string
  /** Omit / pass null to hide the secondary button (Events ticket rail). */
  secondaryLabel?: string | null
  /** Route for the secondary CTA. Without it, the secondary button looks disabled. */
  secondaryTo?: string
  footerNote?: string
  /** Content rendered below the main ticket card (resale / assurances). */
  aside?: ReactNode
  children?: ReactNode
  className?: string
}

/** Sticky booking card for detail asides — Events ticket rail Figma `207:5022`. */
export function StickyCtaCard({
  fromLabel = 'Tickets from',
  fromPrice,
  note,
  tiers,
  totals,
  total,
  primaryLabel = 'Choose your seats',
  primaryTo,
  secondaryLabel = null,
  secondaryTo,
  footerNote,
  aside,
  children,
  className,
}: StickyCtaCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className={cn(
        'sticky top-[100px] flex w-[388px] shrink-0 flex-col gap-[14px]',
        className,
      )}
    >
      <div className="flex w-full flex-col rounded-[20px] border border-border-default bg-surface-default p-[22px] shadow-[0px_18px_40px_-26px_rgba(25,16,8,0.3),0px_1px_2px_0px_rgba(25,16,8,0.04)]">
        <div className="flex w-full items-baseline justify-between">
          <p className="text-[15px] text-ink-secondary">{fromLabel}</p>
          <p className="text-[26px] font-semibold tabular-nums text-ink-primary">
            {fromPrice}
          </p>
        </div>
        {note && (
          <p className="mt-xs text-[13px] font-semibold text-brand-gradient-end">{note}</p>
        )}

        {tiers && tiers.length > 0 && (
          <div className="mt-[18px] flex flex-col gap-row-gap">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'flex flex-col gap-sm rounded-[14px] border p-[14px]',
                  tier.selected
                    ? 'border-brand-primary bg-bg-tint-brand'
                    : 'border-border-default bg-surface-default',
                )}
              >
                <div className="flex items-start justify-between gap-md">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-ink-primary">{tier.name}</p>
                    <p className="mt-[2px] text-[13px] leading-[1.4] text-ink-secondary">
                      {tier.detail}
                    </p>
                  </div>
                  <div className="shrink-0 text-end">
                    <p className="text-[16px] font-semibold tabular-nums text-ink-primary">
                      {tier.price}
                    </p>
                    <p
                      className={cn(
                        'text-[12px]',
                        tier.urgent ? 'text-brand-gradient-end' : 'text-ink-secondary',
                        tier.left === 'Sold out' && 'text-ink-muted',
                      )}
                    >
                      {tier.left}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-ink-muted">
                    {tier.maxLabel ?? 'Max 6 per order'}
                  </p>
                  <div
                    className="flex items-center gap-row-gap opacity-55"
                    title="Seat quantities are chosen on the hall map"
                  >
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled
                      className="flex size-[30px] cursor-not-allowed items-center justify-center rounded-[15px] border border-border-default bg-surface-default text-ink-disabled"
                    >
                      <MinusIcon size={16} />
                    </button>
                    <span className="min-w-[1ch] text-center text-[15px] font-semibold text-ink-primary tabular-nums">
                      {tier.qty ?? 0}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled
                      className="flex size-[30px] cursor-not-allowed items-center justify-center rounded-[15px] border border-border-default bg-surface-default text-[16px] text-ink-disabled"
                    >
                      <PlusIcon size={16} />
                    </button>
                  </div>
                </div>
                {tier.soldOutRail && (
                  <div className="flex w-full flex-col gap-[11px] pt-[3px]">
                    <div className="h-px w-full bg-border-divider" />
                    <div className="flex w-full items-center justify-between gap-sm">
                      <p className="text-[12px] font-medium text-ink-secondary">
                        {tier.soldOutRail.note}
                      </p>
                      <Link
                        to={tier.soldOutRail.to ?? '/auctions'}
                        className="flex shrink-0 items-center gap-[5px] text-[13px] font-semibold text-ink-brand"
                      >
                        {tier.soldOutRail.cta}
                        <ArrowRightIcon size={13} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {children}

        {totals && totals.length > 0 && (
          <div className="mt-[18px] flex w-full flex-col gap-sm border-t border-border-divider pt-[14px]">
            {totals.map((line) => (
              <div
                key={line.label}
                className="flex w-full items-baseline justify-between text-[14px]"
              >
                <span className="text-ink-secondary">{line.label}</span>
                <span className="tabular-nums text-ink-primary">{line.value}</span>
              </div>
            ))}
            {total && (
              <div className="flex w-full items-baseline justify-between border-t border-border-divider pt-sm font-semibold text-ink-primary">
                <span className="text-[15px]">Total</span>
                <span className="text-[22px] tabular-nums">{total}</span>
              </div>
            )}
          </div>
        )}

        <div className={cn('flex flex-col gap-sm', totals ? 'mt-lg' : 'mt-[18px]')}>
          {/* Figma Choose seats is 52/26 vs Button L 48/24 — literal height wins. */}
          <Button
            size="lg"
            className="h-[52px] w-full rounded-[26px] text-[16px] font-semibold"
            disabled={!primaryTo}
            title={primaryTo ? undefined : 'Action not available yet'}
            onClick={primaryTo ? () => navigate(primaryTo) : undefined}
          >
            {primaryLabel}
          </Button>
          {secondaryLabel ? (
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={!secondaryTo}
              title={secondaryTo ? undefined : 'Not available yet'}
              onClick={secondaryTo ? () => navigate(secondaryTo) : undefined}
            >
              {secondaryLabel}
            </Button>
          ) : null}
        </div>

        {footerNote && (
          <p className="mt-row-gap text-center text-[12px] leading-[1.5] text-ink-muted">
            {footerNote}
          </p>
        )}
      </div>

      {aside}
    </div>
  )
}

export function StickyCtaResaleCard({
  title,
  ends,
  body,
  cta,
  to = '/auctions',
}: {
  title: string
  ends: string
  body: string
  cta: string
  to?: string
}) {
  return (
    <div className="flex w-full flex-col rounded-[18px] border border-border-default bg-surface-default p-[18px]">
      <div className="flex w-full items-center justify-between">
        <p className="text-[15px] font-semibold text-ink-primary">{title}</p>
        <p className="text-[12px] font-semibold text-brand-gradient-end">{ends}</p>
      </div>
      <p className="mt-row-gap text-[13px] leading-[1.5] text-ink-secondary">{body}</p>
      <Link
        to={to}
        className="mt-[14px] flex h-[42px] w-full items-center justify-center rounded-[21px] border border-border-default bg-surface-default text-[14px] font-semibold text-ink-primary"
      >
        {cta}
      </Link>
    </div>
  )
}

export function StickyCtaAssurances({ items }: { items: readonly string[] }) {
  return (
    <div className="flex w-full flex-col gap-row-gap rounded-[18px] border border-border-default bg-bg-warm p-[18px]">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-row-gap">
          <CheckGlyphIcon size={13} className="mt-[2px] shrink-0 text-ink-brand" />
          <p className="min-w-0 flex-1 text-[13px] leading-[1.45] text-ink-body">{item}</p>
        </div>
      ))}
    </div>
  )
}
