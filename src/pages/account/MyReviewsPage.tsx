import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StarRating, StatusBadge } from '@/components/data-display'
import { Button } from '@/components/ui'
import { AccountPageHead } from '@/layouts'
import { REVIEWS, REVIEWS_AWAITING } from '@/pages/_account/fixtures'
import { useGetMyReviewsQuery } from '@/app/api/accountApis'

function mapWrittenReview(record: Record<string, unknown>, index: number) {
  const fallback = REVIEWS[index % REVIEWS.length]
  return {
    event: String(record.event ?? record.title ?? record.subject ?? fallback.event),
    rating: Number(record.rating ?? record.score ?? fallback.rating),
    excerpt: String(record.review ?? record.comment ?? record.excerpt ?? fallback.excerpt),
    date: String(record.date ?? record.created_at ?? fallback.date),
  }
}

function mapAwaitingReview(record: Record<string, unknown>, index: number) {
  const fallback = REVIEWS_AWAITING[index % REVIEWS_AWAITING.length]
  const name = String(record.name ?? record.title ?? record.event ?? fallback.name)
  return {
    initials: String(record.initials ?? name.slice(0, 2).toUpperCase()),
    name,
    kind: String(record.kind ?? record.type ?? fallback.kind),
    meta: String(record.meta ?? record.subtitle ?? fallback.meta),
  }
}

function isAwaitingReview(record: Record<string, unknown>) {
  const status = String(record.status ?? '').toLowerCase()
  if (status.includes('await') || status.includes('pending')) return true
  const rating = Number(record.rating ?? record.score ?? 0)
  const text = String(record.review ?? record.comment ?? '').trim()
  return rating <= 0 && !text
}

/** My reviews — Figma `207:9974`. */
export function MyReviewsPage() {
  const [tab, setTab] = useState(0)
  const { data: reviews } = useGetMyReviewsQuery()

  const { awaiting, written } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { awaiting: [...REVIEWS_AWAITING], written: [...REVIEWS] }
    }
    const pending = reviews.filter(isAwaitingReview)
    const done = reviews.filter((record) => !isAwaitingReview(record))
    return {
      awaiting: pending.map(mapAwaitingReview),
      written: done.map(mapWrittenReview),
    }
  }, [reviews])

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
            {awaiting.map((item) => (
              <article
                key={item.name}
                className="flex flex-wrap items-center gap-[18px] rounded-[20px] border border-border-default bg-surface-default px-[24px] py-[20px]"
              >
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
                  <StarRating />
                  <Button size="md" className="h-[40px] rounded-[20px] px-[18px] text-[13.5px] font-bold">
                    Write it
                  </Button>
                </div>
              </article>
            ))}
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
                  <Button variant="secondary" size="sm">
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
