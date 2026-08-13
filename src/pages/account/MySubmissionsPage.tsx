import { Link } from 'react-router-dom'
import { StatusBadge, type StatusTone } from '@/components/data-display'
import { Button } from '@/components/ui'
import { AccountPageHead } from '@/layouts'
import { SUBMISSIONS } from '@/pages/_account/fixtures'

function submissionTone(status: string): StatusTone {
  if (status === 'Published') return 'successTint'
  if (status === 'Under review') return 'brandTint'
  if (status === 'Declined') return 'dangerTint'
  return 'inactive'
}

/** My submissions — Figma `207:7362`. */
export function MySubmissionsPage() {
  return (
    <>
      <AccountPageHead
        eyebrow="Your account"
        title="Places you've added"
        subtitle="Every experience you've submitted, and where it is in review."
        className="[&>div]:max-w-[1040px]"
        actions={
          <Link to="/submit-experience">
            <Button size="lg">+ Add a place</Button>
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-[1040px] px-page-gutter pt-3xl pb-[96px]">
        <ul className="flex flex-col gap-[14px]">
          {SUBMISSIONS.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-xl rounded-[20px] border border-border-default bg-surface-default px-[24px] py-[20px] sm:flex-row sm:items-center sm:gap-[20px]"
            >
              <div className="relative h-[90px] w-full shrink-0 overflow-hidden rounded-[12px] bg-gradient-to-br from-[#e8ddd6] to-[#d8ccc4] sm:w-[120px]">
                <img src={item.cover} alt="" className="absolute inset-0 size-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-[10px]">
                  <p className="text-[17px] font-bold text-ink-primary">{item.name}</p>
                  <StatusBadge tone={submissionTone(item.status)}>{item.status}</StatusBadge>
                </div>
                <p className="mt-[4px] text-[13.5px] text-ink-secondary">{item.meta}</p>
                <p
                  className={`mt-[5px] max-w-[560px] text-[13px] leading-[1.5] ${
                    item.status === 'Published'
                      ? 'text-state-success'
                      : item.status === 'Declined'
                        ? 'text-state-danger-deep'
                        : 'text-ink-secondary'
                  }`}
                >
                  {item.note}
                </p>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-[8px] sm:w-[170px]">
                <Button variant="secondary" size="md" className="h-[40px] w-full rounded-[20px]">
                  {item.cta}
                </Button>
                {'aux' in item && item.aux && (
                  <button
                    type="button"
                    className="inline-flex h-[34px] items-center justify-center text-[12.5px] font-semibold text-border-danger hover:opacity-80"
                  >
                    {item.aux}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
