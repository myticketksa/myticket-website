import { Wrench as WrenchIcon } from '@phosphor-icons/react'
import { Logo } from '@/components/navigation'

/**
 * Maintenance — Figma `207:12106`.
 * Standalone (no SiteHeader/SiteFooter). Routed outside MainLayout.
 */
export function MaintenancePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-page px-page-gutter py-[56px]">
      <div className="flex w-full max-w-[560px] flex-col items-center text-center">
        <Logo height={44} />
        <div className="mt-[28px] flex size-[64px] items-center justify-center rounded-[32px] bg-bg-tint-brand text-ink-brand">
          <WrenchIcon size={24} weight="regular" />
        </div>
        <h1 className="mt-[20px] text-[44px] leading-[1.03] font-extrabold tracking-[-1.54px] text-ink-primary">
          Quick soundcheck. Back shortly.
        </h1>
        <p className="mt-[12px] text-[16px] leading-[1.6] text-ink-secondary">
          We&apos;re doing planned maintenance and expect to be back by{' '}
          <span className="font-bold text-ink-primary">04:00 AST</span>. Your tickets, wallet and
          waitlist places are untouched.
        </p>
        <p className="mt-[10px] text-[14px] leading-[1.6] text-ink-secondary">
          Tickets for tonight? Your QR codes in the mobile app keep working offline throughout.
        </p>
        <div className="mt-[28px] flex w-full flex-wrap items-center justify-between gap-md rounded-[16px] border border-border-default bg-surface-default px-[20px] py-[16px] text-[13.5px]">
          <span className="text-ink-secondary">Live updates while we work</span>
          <span className="font-bold text-ink-primary">
            <a
              href="https://status.myticket.sa"
              className="text-ink-brand hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              status.myticket.sa
            </a>
            <span className="text-ink-muted"> · </span>
            <a
              href="https://x.com/MyTicketKSA"
              className="text-ink-brand hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              @MyTicketKSA
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}
