import type { ReactNode } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { ArrowLeftIcon } from '@/components/icons'
import { PageFade } from '@/components/motion'
import { Logo, SiteFooter } from '@/components/navigation'
import { cn } from '@/lib/cn'

/**
 * Shared Logo · LABEL · Back funnel chrome — Figma ticket actions, support raise/chat,
 * apply / submit / application-submitted. No SiteHeader.
 */
export interface FunnelHeaderProps {
  label: string
  backHref: string
  backLabel: string
  className?: string
  /** When set, replaces the default back link (e.g. Save & exit). */
  rightSlot?: ReactNode
  showLabel?: boolean
}

export function FunnelHeader({
  label,
  backHref,
  backLabel,
  className,
  rightSlot,
  showLabel = true,
}: FunnelHeaderProps) {
  return (
    <header
      className={cn(
        'flex h-[72px] w-full items-center border-b border-border-default bg-bg-page',
        className,
      )}
    >
      <div className="mx-auto grid h-full w-full max-w-[var(--container-page)] grid-cols-[1fr_auto_1fr] items-center gap-sm px-page-gutter sm:gap-lg">
        <Link to="/" className="justify-self-start shrink-0" aria-label="MyTicket home">
          <Logo height={36} />
        </Link>
        {showLabel ? (
          <p className="min-w-0 truncate text-center text-[11px] font-bold tracking-[1.04px] text-ink-muted uppercase sm:text-[13px]">
            {label}
          </p>
        ) : (
          <span />
        )}
        <div className="justify-self-end">
          {rightSlot ?? (
            <Link
              to={backHref}
              className="flex shrink-0 items-center gap-[5px] text-[13px] font-semibold text-ink-secondary transition-colors duration-micro ease-micro hover:text-ink-brand sm:text-[14px]"
            >
              <ArrowLeftIcon size={14} />
              <span className="max-sm:sr-only">{backLabel}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

/**
 * Funnel shell: Outlet + SiteFooter. Pages own FunnelHeader / TicketActionHeader.
 */
export function FunnelLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-page">
      <div className="flex flex-1 flex-col">
        <PageFade>
          <Outlet />
        </PageFade>
      </div>
      <SiteFooter />
    </div>
  )
}
