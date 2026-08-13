import { Link } from 'react-router-dom'
import { ArrowLeftIcon, ArrowUpRightIcon, SuccessIcon } from '@/components/icons'
import { PageSection } from '@/layouts'

/** Application submitted — Figma `207:11329`. */
export function ApplicationSubmittedPage() {
  return (
    <>
      <div className="border-b border-border-default">
        <div className="mx-auto flex h-[72px] w-full max-w-[var(--container-page)] items-center justify-between px-page-gutter">
          <p className="text-[13px] font-bold tracking-[1.04px] text-ink-muted uppercase">
            Application received
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-[5px] text-[14px] font-semibold text-ink-secondary hover:text-ink-brand"
          >
            <ArrowLeftIcon size={14} />
            Back to MyTicket
          </Link>
        </div>
      </div>

      <PageSection padTop={64} padBottom={96}>
        <div className="mx-auto flex max-w-[600px] flex-col items-center text-center">
          <div className="flex size-[64px] items-center justify-center rounded-[32px] bg-state-success-tint text-state-success">
            <SuccessIcon size={26} weight="bold" />
          </div>
          <h1 className="mt-[18px] text-[44px] leading-[1.03] font-extrabold tracking-[-1.54px] text-ink-primary">
            It&apos;s with our team.
          </h1>
          <p className="mt-[12px] text-[16.5px] leading-[1.6] text-ink-secondary">
            Your organizer application is in. We review every application by hand — expect an answer
            within <span className="font-bold text-ink-primary">2–5 working days</span>, by
            notification and email.
          </p>
          <p className="mt-[10px] text-[13.5px] font-bold text-ink-muted">
            Application reference <span className="text-ink-primary">APP-2026-1187</span>
          </p>

          <div className="mt-[32px] w-full rounded-[20px] border border-border-default bg-surface-default px-[26px] py-[24px] text-left">
            <p className="text-[15px] font-bold text-ink-primary">While you wait</p>
            <ul className="mt-[14px] flex flex-col gap-[12px] text-[14px] text-ink-secondary">
              <li className="flex gap-[12px]">
                <span className="font-extrabold text-ink-brand">·</span>
                <span>
                  <span className="font-bold text-ink-primary">Everything guest-side keeps working</span>{' '}
                  — buy tickets, use your wallet, write reviews.
                </span>
              </li>
              <li className="flex gap-[12px]">
                <span className="font-extrabold text-ink-brand">·</span>
                <span>
                  <span className="font-bold text-ink-primary">Follow your application</span> on the
                  business site — you&apos;ll find its live status there.
                </span>
              </li>
              <li className="flex gap-[12px]">
                <span className="font-extrabold text-ink-brand">·</span>
                <span>
                  <span className="font-bold text-ink-primary">If we need anything,</span> we&apos;ll
                  message you rather than decline — check your notifications.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-[20px] flex w-full max-w-[420px] flex-col gap-[10px]">
            <Link
              to="/my-submissions"
              className="inline-flex h-btn-lg w-full items-center justify-center gap-control-gap rounded-btn-lg bg-brand-gradient px-btn-pad-lg text-[15px] font-bold text-ink-inverse"
            >
              Follow it on the business site
              <ArrowUpRightIcon size={15} />
            </Link>
            <Link
              to="/events"
              className="inline-flex h-[46px] w-full items-center justify-center rounded-[23px] border-[1.5px] border-border-default bg-surface-default text-[14px] font-semibold text-ink-primary"
            >
              Browse events meanwhile
            </Link>
          </div>
        </div>
      </PageSection>
    </>
  )
}
