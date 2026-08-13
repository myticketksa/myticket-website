import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StarRating, StatusBadge } from '@/components/data-display'
import { Button } from '@/components/ui'
import { AccountPageHead } from '@/layouts'
import { REVIEWS, REVIEWS_AWAITING } from '@/pages/_account/fixtures'

/** My reviews — Figma `207:9974`. */
export function MyReviewsPage() {
  const [tab, setTab] = useState(0)

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
            count: REVIEWS_AWAITING.length,
            active: tab === 0,
            onSelect: () => setTab(0),
          },
          {
            label: 'Written',
            count: REVIEWS.length,
            active: tab === 1,
            onSelect: () => setTab(1),
          },
        ]}
      />

      <div className="mx-auto w-full max-w-[1040px] px-page-gutter pt-3xl pb-[96px]">
        {tab === 0 ? (
          <div className="flex flex-col gap-[12px]">
            {REVIEWS_AWAITING.map((item) => (
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
            {REVIEWS.map((review) => (
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
