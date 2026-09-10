import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge, type StatusTone } from '@/components/data-display'
import { Button } from '@/components/ui'
import { useLocale } from '@/i18n/locale'
import { AccountPageHead } from '@/layouts'
import { useGetMyApplicationQuery } from '@/app/api/accountApis'
import {
  mapApplicationView,
  type ApplicationStatus,
} from '@/pages/_account/mapApplication'

function statusTone(status: ApplicationStatus): StatusTone {
  if (status === 'accepted') return 'successTint'
  if (status === 'rejected') return 'dangerTint'
  return 'brandTint'
}

function statusLabel(status: ApplicationStatus) {
  if (status === 'accepted') return 'Accepted'
  if (status === 'rejected') return 'Rejected'
  return 'Pending'
}

/** Guest vendor application status — not a business workspace. */
export function MyVendorApplicationPage() {
  const { roleLabel } = useLocale()
  const role = roleLabel('vendor')
  const { data } = useGetMyApplicationQuery()
  const application = useMemo(() => mapApplicationView(data, 'vendor'), [data])

  return (
    <>
      <AccountPageHead
        eyebrow="Your account"
        title={`My ${role} application`}
        subtitle="Track the request you submitted. Acceptance does not change your login — you remain a guest."
        className="[&>div]:max-w-[1040px]"
        actions={
          <Link to="/apply/vendor">
            <Button size="lg" variant="secondary">
              View application form
            </Button>
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-[1040px] px-page-gutter pt-3xl pb-[96px]">
        <div className="flex flex-col gap-xl rounded-[20px] border border-border-default bg-surface-default px-[24px] py-[20px] sm:flex-row sm:items-center sm:gap-[20px]">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-[10px]">
              <p className="text-[17px] font-bold text-ink-primary">{role} request</p>
              <StatusBadge tone={statusTone(application.status)}>
                {statusLabel(application.status)}
              </StatusBadge>
            </div>
            <p className="mt-[4px] text-[13.5px] text-ink-secondary">
              {application.submittedAt} · Ref {application.reference}
            </p>
            <p
              className={`mt-[5px] max-w-[640px] text-[13px] leading-[1.5] ${
                application.status === 'accepted'
                  ? 'text-state-success'
                  : application.status === 'rejected'
                    ? 'text-state-danger-deep'
                    : 'text-ink-secondary'
              }`}
            >
              {application.note}
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-[8px] sm:w-[170px]">
            <Link to="/support/new">
              <Button variant="secondary" size="md" className="h-[40px] w-full rounded-[20px]">
                Contact support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
