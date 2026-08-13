import { Link, Outlet, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from '@/components/icons'
import { Logo, SiteFooter } from '@/components/navigation'
import { cn } from '@/lib/cn'

/**
 * Ticket-action flow header — Logo · LABEL · Back to ticket.
 * Verified on Resell `207:9700`, Gift `207:9806`, Refund `207:9879`.
 * Distinct from SiteHeader and PurchaseHeader.
 */
export interface TicketActionHeaderProps {
  label: string
  backHref?: string
  backLabel?: string
  className?: string
}

export function TicketActionHeader({
  label,
  backHref,
  backLabel = 'Back to ticket',
  className,
}: TicketActionHeaderProps) {
  const { id = 'winter-nights' } = useParams()
  const href = backHref ?? `/my-tickets/${id}`

  return (
    <header
      className={cn(
        'flex h-[72px] w-full items-center border-b border-border-default bg-bg-page',
        className,
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-[var(--container-page)] items-center justify-between px-page-gutter">
        <Link to="/" className="shrink-0" aria-label="MyTicket home">
          <Logo height={36} />
        </Link>
        <p className="text-[13px] font-bold tracking-[1.04px] text-ink-muted uppercase">
          {label}
        </p>
        <Link
          to={href}
          className="flex shrink-0 items-center gap-[5px] text-[14px] font-semibold text-ink-secondary hover:text-ink-brand"
        >
          <ArrowLeftIcon size={14} />
          {backLabel}
        </Link>
      </div>
    </header>
  )
}

/**
 * Pattern for Resell / Gift / Refund — page owns TicketActionHeader + body;
 * shell supplies SiteFooter. No SiteHeader (Figma draws the action chrome).
 */
export function TicketActionLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-page">
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  )
}
