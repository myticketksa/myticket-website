import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRightIcon, SuccessIcon } from '@/components/icons'
import { useLocale, type RoleKey } from '@/i18n/locale'
import { FunnelHeader, PageSection } from '@/layouts'

function resolveRole(raw: string | null): 'vendor' | 'talent' {
  return raw === 'talent' ? 'talent' : 'vendor'
}

/** Application submitted — Figma `207:11329`. */
export function ApplicationSubmittedPage() {
  const [params] = useSearchParams()
  const roleKey = resolveRole(params.get('role'))
  const { roleLabel } = useLocale()
  const role = roleLabel(roleKey as RoleKey)
  const statusHref =
    roleKey === 'talent' ? '/my-talent-application' : '/my-vendor-application'

  return (
    <>
      <FunnelHeader
        label="Request received"
        backHref="/"
        backLabel="Back to MyTicket"
      />

      <PageSection padTop={64} padBottom={96}>
        <div className="mx-auto flex max-w-[600px] flex-col items-center text-center">
          <div className="flex size-[64px] items-center justify-center rounded-[32px] bg-state-success-tint text-state-success">
            <SuccessIcon size={26} weight="bold" />
          </div>
          <h1 className="mt-[18px] text-[44px] leading-[1.03] font-extrabold tracking-[-1.54px] text-ink-primary">
            It&apos;s with our team.
          </h1>
          <p className="mt-[12px] text-[16.5px] leading-[1.6] text-ink-secondary">
            Your {role} request is in. We review every submission by hand — expect an answer within{' '}
            <span className="font-bold text-ink-primary">2–5 working days</span>, by notification
            and email. You remain a guest; acceptance does not change your login.
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
                  <span className="font-bold text-ink-primary">Follow your request status</span> on
                  your account — pending, accepted, or rejected.
                </span>
              </li>
              <li className="flex gap-[12px]">
                <span className="font-extrabold text-ink-brand">·</span>
                <span>
                  <span className="font-bold text-ink-primary">If we need anything,</span> we&apos;ll
                  reach out — contact after acceptance happens outside the platform.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-[20px] flex w-full max-w-[420px] flex-col gap-[10px]">
            <Link
              to={statusHref}
              className="inline-flex h-btn-lg w-full items-center justify-center gap-control-gap rounded-btn-lg bg-brand-gradient px-btn-pad-lg text-[15px] font-bold text-ink-inverse"
            >
              Track your {role} request
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
