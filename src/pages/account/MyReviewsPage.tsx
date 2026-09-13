import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { StarRating, StatusBadge } from '@/components/data-display'
import { EmptyState } from '@/components/feedback'
import { Button, Field, Textarea } from '@/components/ui'
import { AccountPageHead } from '@/layouts'
import { useGetMyReviewsQuery, useSubmitReviewMutation } from '@/app/api/accountApis'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAuthUser } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { apiErrorMessage } from '@/lib/api/unwrap'
import { cn } from '@/lib/cn'

type ReviewType = 'event' | 'experience' | 'talent' | 'vendor'

type AwaitingItem = {
  key: string
  initials: string
  name: string
  kind: string
  meta: string
  type: ReviewType
  id: number
}

function mapReviewType(raw: unknown, kindLabel: string): ReviewType {
  const value = String(raw ?? kindLabel).toLowerCase()
  if (value.includes('experience')) return 'experience'
  if (value.includes('talent')) return 'talent'
  if (value.includes('vendor')) return 'vendor'
  return 'event'
}

function mapWrittenReview(record: Record<string, unknown>) {
  return {
    event: String(record.event ?? record.title ?? record.subject ?? 'Review'),
    rating: Number(record.rating ?? record.score ?? 0),
    excerpt: String(record.review ?? record.comment ?? record.excerpt ?? ''),
    date: String(record.date ?? record.created_at ?? ''),
  }
}

function mapAwaitingReview(record: Record<string, unknown>, index: number): AwaitingItem {
  const name = String(record.name ?? record.title ?? record.event ?? 'Event')
  const kind = String(record.kind ?? record.type ?? 'Event')
  const id = Number(record.id ?? record.subject_id ?? record.event_id ?? index + 1)
  return {
    key: `${id}-${name}`,
    initials: String(record.initials ?? name.slice(0, 2).toUpperCase()),
    name,
    kind,
    meta: String(record.meta ?? record.subtitle ?? ''),
    type: mapReviewType(record.type ?? record.reviewable_type, kind),
    id: Number.isFinite(id) && id > 0 ? id : index + 1,
  }
}

function isAwaitingReview(record: Record<string, unknown>) {
  const status = String(record.status ?? '').toLowerCase()
  if (status.includes('await') || status.includes('pending')) return true
  const rating = Number(record.rating ?? record.score ?? 0)
  const text = String(record.review ?? record.comment ?? '').trim()
  return rating <= 0 && !text
}

function RatingPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (next: number) => void
}) {
  const { t } = useTranslation('account')
  return (
    <div className="flex items-center gap-[4px]" role="radiogroup" aria-label={t('reviews.ratingAria')}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={t('reviews.stars', { count: star })}
          onClick={() => onChange(star)}
          className={cn(
            'text-[22px] leading-none tracking-[2px]',
            star <= value ? 'text-ink-brand' : 'text-border-default',
          )}
        >
          ★
        </button>
      ))}
    </div>
  )
}

/** My reviews — Figma `207:9974`. Submit matches Postman `POST /reviews`. */
export function MyReviewsPage() {
  const { t } = useTranslation(['account', 'common'])
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const { data: reviews, isLoading } = useGetMyReviewsQuery()
  const [submitReview, submitState] = useSubmitReviewMutation()
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')

  const { awaiting, written } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { awaiting: [] as AwaitingItem[], written: [] as ReturnType<typeof mapWrittenReview>[] }
    }
    const pending = reviews.filter(isAwaitingReview)
    const done = reviews.filter((record) => !isAwaitingReview(record))
    return {
      awaiting: pending.map(mapAwaitingReview),
      written: done.map(mapWrittenReview),
    }
  }, [reviews])

  async function handleSubmit(item: AwaitingItem) {
    if (rating < 1) {
      dispatch(toastPushed('error', t('account:reviews.pickRating')))
      return
    }
    try {
      await submitReview({
        type: item.type,
        id: item.id,
        rating,
        name: user?.name ?? 'Guest',
        review: reviewText.trim() || undefined,
        comment: reviewText.trim() || undefined,
      }).unwrap()
      dispatch(toastPushed('success', t('account:reviews.success')))
      setActiveKey(null)
      setReviewText('')
      setRating(5)
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('account:reviews.error'))))
    }
  }

  return (
    <>
      <AccountPageHead
        eyebrow={t('account:eyebrow')}
        title={t('account:reviews.title')}
        subtitle={t('account:reviews.subtitle')}
        className="[&>div]:max-w-[1040px]"
        tabs={[
          {
            label: t('account:reviews.tabWaiting'),
            count: awaiting.length,
            active: tab === 0,
            onSelect: () => setTab(0),
          },
          {
            label: t('account:reviews.tabWritten'),
            count: written.length,
            active: tab === 1,
            onSelect: () => setTab(1),
          },
        ]}
      />

      <div className="mx-auto w-full max-w-[1040px] px-page-gutter pt-3xl pb-[96px]">
        {tab === 0 ? (
          <div className="flex flex-col gap-[12px]">
            {!isLoading && awaiting.length === 0 && (
              <div className="flex justify-center py-3xl">
                <EmptyState
                  variant="firstUse"
                  title={t('account:reviews.emptyTitle')}
                  body={t('account:reviews.emptyBody')}
                  ctaLabel={t('common:actions.browseEvents')}
                  onCtaClick={() => navigate('/events')}
                />
              </div>
            )}
            {awaiting.map((item) => {
              const open = activeKey === item.key
              return (
                <article
                  key={item.key}
                  className="rounded-[20px] border border-border-default bg-surface-default px-[24px] py-[20px]"
                >
                  <div className="flex flex-wrap items-center gap-[18px]">
                    <div className="flex size-[54px] shrink-0 items-center justify-center rounded-[16px] bg-brand-gradient text-[17px] font-extrabold text-ink-inverse">
                      {item.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-[9px]">
                        <p className="text-[16px] font-bold text-ink-primary">{item.name}</p>
                        <StatusBadge tone="neutralOutline">{item.kind}</StatusBadge>
                      </div>
                      <p className="mt-[3px] text-[13.5px] text-ink-secondary">{item.meta}</p>
                    </div>
                    <div className="flex items-center gap-[14px]">
                      {!open && <StarRating />}
                      <Button
                        size="md"
                        className="h-[40px] rounded-[20px] px-[18px] text-[13.5px] font-bold"
                        onClick={() => {
                          setActiveKey(open ? null : item.key)
                          setRating(5)
                          setReviewText('')
                        }}
                      >
                        {open ? t('common:actions.close') : t('account:reviews.writeIt')}
                      </Button>
                    </div>
                  </div>

                  {open && (
                    <div className="mt-[18px] border-t border-border-divider pt-[18px]">
                      <p className="mb-[10px] text-[13px] font-semibold text-ink-primary">
                        {t('account:reviews.yourScore')}
                      </p>
                      <RatingPicker value={rating} onChange={setRating} />
                      <Field
                        className="mt-[16px]"
                        label={
                          <>
                            {t('account:reviews.wordsLabel')}{' '}
                            <span className="font-medium text-ink-muted">
                              {t('account:reviews.wordsOptional')}
                            </span>
                          </>
                        }
                        htmlFor={`review-${item.key}`}
                      >
                        <Textarea
                          id={`review-${item.key}`}
                          rows={3}
                          value={reviewText}
                          onChange={(event) => setReviewText(event.target.value)}
                          placeholder={t('account:reviews.placeholder')}
                        />
                      </Field>
                      <Button
                        size="md"
                        className="mt-[14px]"
                        loading={submitState.isLoading}
                        onClick={() => void handleSubmit(item)}
                      >
                        {t('account:reviews.submit')}
                      </Button>
                    </div>
                  )}
                </article>
              )
            })}
            {awaiting.length > 0 && (
            <div className="mt-[2px] rounded-[16px] border border-border-default bg-bg-page px-[20px] py-lg">
              <p className="text-[13.5px] text-ink-secondary">{t('account:reviews.hint')}</p>
            </div>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-[12px]">
            {!isLoading && written.length === 0 && (
              <li className="flex justify-center py-3xl list-none">
                <EmptyState
                  variant="firstUse"
                  title={t('account:reviews.writtenEmptyTitle')}
                  body={t('account:reviews.writtenEmptyBody')}
                  ctaLabel={t('common:actions.browseEvents')}
                  onCtaClick={() => navigate('/events')}
                />
              </li>
            )}
            {written.map((review) => (
              <li
                key={review.event}
                className="rounded-[20px] border border-border-default bg-surface-default px-[24px] py-[20px]"
              >
                <div className="flex flex-wrap items-center justify-between gap-md">
                  <p className="text-[16px] font-bold text-ink-primary">{review.event}</p>
                  <span className="text-[12px] text-ink-muted">{review.date}</span>
                </div>
                <div className="mt-sm">
                  <StarRating value={review.rating} />
                </div>
                <p className="mt-md text-[14px] leading-[1.55] text-ink-secondary">{review.excerpt}</p>
                <div className="mt-lg flex gap-sm">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled
                    title={t('account:reviews.editUnavailable')}
                  >
                    {t('common:actions.edit')}
                  </Button>
                  <Link to="/events">
                    <Button variant="ghost" size="sm">
                      {t('account:reviews.viewEvent')}
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
