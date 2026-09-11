import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StarRating, StatusBadge } from '@/components/data-display'
import { Button, Field, Textarea } from '@/components/ui'
import { AccountPageHead } from '@/layouts'
import { REVIEWS, REVIEWS_AWAITING } from '@/pages/_account/fixtures'
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

function mapWrittenReview(record: Record<string, unknown>, index: number) {
  const fallback = REVIEWS[index % REVIEWS.length]
  return {
    event: String(record.event ?? record.title ?? record.subject ?? fallback.event),
    rating: Number(record.rating ?? record.score ?? fallback.rating),
    excerpt: String(record.review ?? record.comment ?? record.excerpt ?? fallback.excerpt),
    date: String(record.date ?? record.created_at ?? fallback.date),
  }
}

function mapAwaitingReview(record: Record<string, unknown>, index: number): AwaitingItem {
  const fallback = REVIEWS_AWAITING[index % REVIEWS_AWAITING.length]
  const name = String(record.name ?? record.title ?? record.event ?? fallback.name)
  const kind = String(record.kind ?? record.type ?? fallback.kind)
  const id = Number(record.id ?? record.subject_id ?? record.event_id ?? index + 1)
  return {
    key: `${id}-${name}`,
    initials: String(record.initials ?? name.slice(0, 2).toUpperCase()),
    name,
    kind,
    meta: String(record.meta ?? record.subtitle ?? fallback.meta),
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
  return (
    <div className="flex items-center gap-[4px]" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
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
  const [tab, setTab] = useState(0)
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const { data: reviews } = useGetMyReviewsQuery()
  const [submitReview, submitState] = useSubmitReviewMutation()
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')

  const { awaiting, written } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        awaiting: REVIEWS_AWAITING.map((item, index) => ({
          key: `fixture-${item.name}`,
          initials: item.initials,
          name: item.name,
          kind: item.kind,
          meta: item.meta,
          type: mapReviewType(item.kind, item.kind),
          id: index + 1,
        })),
        written: [...REVIEWS],
      }
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
      dispatch(toastPushed('error', 'Pick a star rating'))
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
      dispatch(toastPushed('success', 'Review submitted'))
      setActiveKey(null)
      setReviewText('')
      setRating(5)
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not submit review')))
    }
  }

  return (
    <>
      <AccountPageHead
        eyebrow="Your account"
        title="Your reviews"
        subtitle="The nights you've been to and what you said about them. Reviews come only from people who were really there — that's why yours matter."
        className="[&>div]:max-w-[1040px]"
        tabs={[
          {
            label: 'Waiting for you',
            count: awaiting.length,
            active: tab === 0,
            onSelect: () => setTab(0),
          },
          {
            label: 'Written',
            count: written.length,
            active: tab === 1,
            onSelect: () => setTab(1),
          },
        ]}
      />

      <div className="mx-auto w-full max-w-[1040px] px-page-gutter pt-3xl pb-[96px]">
        {tab === 0 ? (
          <div className="flex flex-col gap-[12px]">
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
                        {open ? 'Close' : 'Write it'}
                      </Button>
                    </div>
                  </div>

                  {open && (
                    <div className="mt-[18px] border-t border-border-divider pt-[18px]">
                      <p className="mb-[10px] text-[13px] font-semibold text-ink-primary">
                        Your score
                      </p>
                      <RatingPicker value={rating} onChange={setRating} />
                      <Field
                        className="mt-[16px]"
                        label={
                          <>
                            A few words{' '}
                            <span className="font-medium text-ink-muted">— optional</span>
                          </>
                        }
                        htmlFor={`review-${item.key}`}
                      >
                        <Textarea
                          id={`review-${item.key}`}
                          rows={3}
                          value={reviewText}
                          onChange={(event) => setReviewText(event.target.value)}
                          placeholder="What stood out — entry, sound, seats, the night itself."
                        />
                      </Field>
                      <Button
                        size="md"
                        className="mt-[14px]"
                        loading={submitState.isLoading}
                        onClick={() => void handleSubmit(item)}
                      >
                        Submit review
                      </Button>
                    </div>
                  )}
                </article>
              )
            })}
            <div className="mt-[2px] rounded-[16px] border border-border-default bg-bg-page px-[20px] py-lg">
              <p className="text-[13.5px] text-ink-secondary">
                Tap the stars to start — a score is all that&apos;s required, words are up to you. You
                can change anything for 30 days after posting.
              </p>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-[12px]">
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
                  <Button variant="secondary" size="sm" disabled title="Edit not available yet">
                    Edit
                  </Button>
                  <Link to="/events">
                    <Button variant="ghost" size="sm">
                      View event
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
