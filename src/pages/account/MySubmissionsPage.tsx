import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { StatusBadge, type StatusTone } from '@/components/data-display'
import { EmptyState } from '@/components/feedback'
import { Button } from '@/components/ui'
import { AccountPageHead } from '@/layouts'
import { useGetMySubmissionsQuery } from '@/app/api/experiencesApi'

interface SubmissionItem {
  id: string
  name: string
  status: string
  meta: string
  note: string
  cta: string
  aux?: string
  cover: string
}

function mapSubmission(record: Record<string, unknown>): SubmissionItem {
  const status = String(record.status ?? record.state ?? 'Submitted')
  return {
    id: String(record.id ?? record.reference ?? ''),
    name: String(record.name ?? record.title ?? 'Submission'),
    status,
    meta: String(record.meta ?? record.location ?? record.submitted_at ?? ''),
    note: String(record.note ?? record.message ?? ''),
    cta: String(record.cta ?? 'View submission'),
    aux: record.aux ? String(record.aux) : undefined,
    cover: String(record.cover ?? record.image ?? record.image_url ?? ''),
  }
}

function submissionTone(status: string): StatusTone {
  if (status === 'Published') return 'successTint'
  if (status === 'Under review') return 'brandTint'
  if (status === 'Declined') return 'dangerTint'
  return 'inactive'
}

/** My submissions — Figma `207:7362`. */
export function MySubmissionsPage() {
  const { t } = useTranslation('account')
  const navigate = useNavigate()
  const { data: submissions, isLoading } = useGetMySubmissionsQuery()
  const items = useMemo(() => {
    if (submissions && submissions.length > 0) return submissions.map(mapSubmission)
    return []
  }, [submissions])

  return (
    <>
      <AccountPageHead
        eyebrow={t('eyebrow')}
        title={t('submissions.title')}
        subtitle={t('submissions.subtitle')}
        className="[&>div]:max-w-[1040px]"
        actions={
          <Link to="/submit-experience">
            <Button size="lg">{t('submissions.addPlace')}</Button>
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-[1040px] px-page-gutter pt-3xl pb-[96px]">
        {!isLoading && items.length === 0 && (
          <div className="flex justify-center py-3xl">
            <EmptyState
              variant="firstUse"
              title={t('submissions.emptyTitle')}
              body={t('submissions.emptyBody')}
              ctaLabel={t('submissions.addPlace')}
              onCtaClick={() => navigate('/submit-experience')}
            />
          </div>
        )}
        <ul className="flex flex-col gap-[14px]">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-xl rounded-[20px] border border-border-default bg-surface-default px-[24px] py-[20px] sm:flex-row sm:items-center sm:gap-[20px]"
            >
              <div className="relative h-[90px] w-full shrink-0 overflow-hidden rounded-[12px] bg-placeholder-gradient sm:w-[120px]">
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
