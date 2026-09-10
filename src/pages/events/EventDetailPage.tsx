import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar } from '@/components/data-display'
import {
  ArrowUpRightIcon,
  CalendarIcon,
  HeartGlyphIcon,
  StarFillIcon,
} from '@/components/icons'
import {
  Breadcrumbs,
  DetailSectionTab,
  DetailSectionTabs,
} from '@/components/navigation'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'
import {
  CATALOG_EVENTS,
  DetailGallery,
  DetailOrganizerBand,
  EVENT_DETAIL,
  EVENT_DETAIL_GALLERY,
  EVENT_DETAIL_VENUE_MAP,
  SimilarSection,
  slugify,
  StickyCtaAssurances,
  StickyCtaCard,
  StickyCtaResaleCard,
} from '@/pages/_guest'

/**
 * Figma `207:4797` tab rail — About · Line-up · Venue · Reviews · Policies.
 * Organizer sits between Venue and Reviews in the continuous article (no tab).
 */
const TABS = ['About', 'Line-up', 'Venue', 'Reviews', 'Policies'] as const
type Tab = (typeof TABS)[number]

const TAB_IDS: Record<Tab, string> = {
  About: 'about',
  'Line-up': 'line-up',
  Venue: 'venue',
  Reviews: 'reviews',
  Policies: 'policies',
}

const REVIEWS = [
  {
    initials: 'MA',
    name: 'Mohammed A.',
    date: 'Reviewed 12 March 2026',
    rating: '5.0',
    body: 'Sound was excellent even at the back of the field. Entry through Gate 3 took five minutes with the app ticket.',
  },
  {
    initials: 'HS',
    name: 'Hala S.',
    date: 'Reviewed 9 March 2026',
    rating: '4.5',
    body: 'Great atmosphere and the family lawn was genuinely comfortable. Food queues got long around 21:00.',
  },
  {
    initials: 'KR',
    name: 'Khalid R.',
    date: 'Reviewed 2 March 2026',
    rating: '4.0',
    body: "Gold pit is worth it if you want to be close, but arrive by 19:00 or you'll be behind the early crowd.",
  },
] as const

const POLICIES = [
  {
    label: 'Refunds',
    body: 'Full refund up to 72 hours before the event. No refunds after that, but tickets can be listed on the resale auction.',
  },
  {
    label: 'Transfers',
    body: 'Free transfer to another MyTicket account up to 2 hours before doors.',
  },
  {
    label: 'Age',
    body: 'All ages. Under 12s must be accompanied and are seated on the eastern lawn.',
  },
  {
    label: 'Prohibited',
    body: 'Professional cameras, outside food and drink, and any glass containers.',
  },
] as const

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=King+Abdullah+Park,+Al+Malaz,+Riyadh+12836'

/** Event detail — Figma `207:4797` continuous article + scroll-spy tabs. */
export function EventDetailPage() {
  const { slug } = useParams()
  const [tab, setTab] = useState<Tab>('About')
  const scrollingToRef = useRef<string | null>(null)
  const title =
    CATALOG_EVENTS.find((e) => slugify(e.title) === slug)?.title ?? EVENT_DETAIL.title

  useEffect(() => {
    const nodes = TABS.map((item) => document.getElementById(TAB_IDS[item])).filter(
      (el): el is HTMLElement => el != null,
    )
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingToRef.current) return
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]
        if (!top?.target.id) return
        const match = (Object.entries(TAB_IDS) as [Tab, string][]).find(
          ([, id]) => id === top.target.id,
        )
        if (match) setTab(match[0])
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] },
    )

    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const jumpTo = (item: Tab) => {
    const id = TAB_IDS[item]
    const el = document.getElementById(id)
    setTab(item)
    if (!el) return
    scrollingToRef.current = id
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      if (scrollingToRef.current === id) scrollingToRef.current = null
    }, 700)
  }

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Events', href: '/events' },
            { label: 'Concerts', href: '/events' },
            { label: title },
          ]}
        />
      </PageSection>

      <PageSection padTop={16} padBottom={0}>
        <DetailGallery
          category={EVENT_DETAIL.category}
          flag={EVENT_DETAIL.flag}
          mainImage={EVENT_DETAIL_GALLERY.main}
          thumbs={EVENT_DETAIL_GALLERY.thumbs}
        />
      </PageSection>

      <PageSection padTop={34} padBottom={0}>
        <div className="flex w-full items-start gap-[48px]">
          <article className="min-w-0 flex-1">
            <h1 className="text-display-hero text-ink-primary">{title}</h1>

            <div className="mt-[14px] flex flex-wrap items-center gap-[18px] text-[15px]">
              <span className="flex items-center gap-[5px] font-semibold text-ink-primary">
                <StarFillIcon size={15} />
                {EVENT_DETAIL.rating}
              </span>
              <span className="text-ink-secondary">{EVENT_DETAIL.when}</span>
              <span className="text-ink-secondary">{EVENT_DETAIL.venue}</span>
              <span className="text-ink-secondary">{EVENT_DETAIL.attendance}</span>
            </div>

            <div className="mt-[22px] flex flex-wrap gap-row-gap">
              <Button
                variant="secondary"
                className="h-[40px] rounded-[20px] border px-lg"
                icon={<HeartGlyphIcon size={16} />}
                disabled
                title="Save requires an account"
              >
                Save
              </Button>
              <Button
                variant="secondary"
                className="h-[40px] rounded-[20px] border px-lg"
                icon={<ArrowUpRightIcon size={16} />}
                disabled
                title="Share not available yet"
              >
                Share
              </Button>
              <Button
                variant="secondary"
                className="h-[40px] rounded-[20px] border px-lg"
                icon={<CalendarIcon size={16} />}
                disabled
                title="Calendar export not available yet"
              >
                Add to calendar
              </Button>
            </div>

            <div className="sticky top-[var(--spacing-header)] z-10 mt-[34px] bg-bg-page pt-sm">
              <DetailSectionTabs aria-label="Event sections">
                {TABS.map((item) => (
                  <DetailSectionTab
                    key={item}
                    active={tab === item}
                    onClick={() => jumpTo(item)}
                  >
                    {item}
                  </DetailSectionTab>
                ))}
              </DetailSectionTabs>
            </div>

            {/* About — Figma draws body + highlights with no section H2. */}
            <section id="about" className="scroll-mt-[calc(var(--spacing-header)+72px)]">
              <p className="mt-[28px] max-w-[720px] text-[16px] leading-[1.6] text-ink-body">
                {EVENT_DETAIL.about}
              </p>
              <div className="mt-[18px] grid max-w-[720px] grid-cols-1 gap-md sm:grid-cols-2">
                {EVENT_DETAIL.highlights.map((h) => (
                  <div
                    key={h.title}
                    className="flex gap-[11px] rounded-[14px] border border-border-default bg-surface-default px-lg py-[14px]"
                  >
                    <span className="mt-[6px] size-[7px] shrink-0 rounded-full bg-brand-primary" />
                    <div>
                      <p className="text-[14px] font-semibold text-ink-primary">{h.title}</p>
                      <p className="mt-[2px] text-[13px] leading-[1.45] text-ink-secondary">
                        {h.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="line-up"
              className="scroll-mt-[calc(var(--spacing-header)+72px)] mt-[44px]"
            >
              <h2 className="text-heading-h2-section text-ink-primary">Line-up</h2>
              <p className="mt-[6px] text-[15px] text-ink-secondary">
                Four acts across one stage. Set times published 48 hours before doors.
              </p>
              <div className="mt-[18px] grid grid-cols-2 gap-lg lg:grid-cols-4">
                {EVENT_DETAIL.lineup.map((act) => (
                  <div
                    key={act.name}
                    className="overflow-hidden rounded-[16px] border border-border-default bg-surface-default"
                  >
                    <div className="h-[150px]">
                      <img src={act.image} alt="" className="size-full object-cover" />
                    </div>
                    <div className="px-[14px] pt-[13px] pb-[15px]">
                      <p className="text-[15px] font-semibold text-ink-primary">{act.name}</p>
                      <p className="mt-[2px] text-[13px] text-ink-secondary">{act.role}</p>
                      <p className="mt-sm text-[12px] font-semibold text-ink-brand">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="venue"
              className="scroll-mt-[calc(var(--spacing-header)+72px)] mt-[44px]"
            >
              <h2 className="text-heading-h2-section text-ink-primary">
                Venue & getting there
              </h2>
              <div className="mt-[18px] overflow-hidden rounded-[18px] border border-border-default bg-surface-default">
                <div className="relative h-[260px] w-full overflow-hidden bg-bg-skeleton">
                  <img
                    src={EVENT_DETAIL_VENUE_MAP}
                    alt="Map of King Abdullah Park, Al Malaz, Riyadh"
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-lg border-b border-border-divider px-3xl py-md">
                  <p className="text-[14px] text-ink-secondary">
                    King Abdullah Park, Al Malaz, Riyadh 12836
                  </p>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-[36px] items-center rounded-[18px] border-[1.5px] border-border-default bg-surface-default px-lg text-[13px] font-semibold text-ink-primary hover:border-border-brand hover:text-ink-brand"
                  >
                    Open in maps
                  </a>
                </div>
                <div className="flex gap-3xl px-3xl pt-[22px] pb-3xl">
                  {[
                    {
                      label: 'Address',
                      body: 'King Abdullah Park, Al Malaz, Riyadh 12836',
                    },
                    {
                      label: 'Getting there',
                      body: 'Metro Line 2 to Al Malaz (7 min walk). Paid parking in lots C and D, SAR 20.',
                    },
                    {
                      label: 'Accessibility',
                      body: 'Step-free entry at Gate 3. Wheelchair bays in the seated tier — book by phone.',
                    },
                  ].map((fact) => (
                    <div key={fact.label} className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                        {fact.label}
                      </p>
                      <p className="mt-[6px] text-[14px] leading-[1.5] text-ink-body">{fact.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organizer — in-frame on Figma between Venue and Reviews; no tab. */}
              <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">Organizer</h2>
              <div className="mt-[18px]">
                <DetailOrganizerBand
                  name={EVENT_DETAIL.organizer.name}
                  eventsLabel={EVENT_DETAIL.organizer.eventsLabel}
                  rating={EVENT_DETAIL.organizer.rating}
                  sinceLabel={EVENT_DETAIL.organizer.sinceLabel}
                  bio={EVENT_DETAIL.organizer.bio}
                  avatar={EVENT_DETAIL.organizer.avatar}
                />
              </div>
            </section>

            <section
              id="reviews"
              className="scroll-mt-[calc(var(--spacing-header)+72px)] mt-[44px]"
            >
              <div className="flex items-end justify-between gap-lg">
                <h2 className="text-heading-h2-section text-ink-primary">Reviews</h2>
                <div className="flex items-center gap-[5px] text-[15px] text-ink-secondary">
                  <StarFillIcon size={15} />
                  <span>{EVENT_DETAIL.reviewsSummary}</span>
                </div>
              </div>
              <div className="mt-[18px] grid grid-cols-1 gap-lg lg:grid-cols-3">
                {REVIEWS.map((review) => (
                  <div
                    key={review.name}
                    className="flex flex-col gap-[11px] rounded-[16px] border border-border-default bg-surface-default p-[18px]"
                  >
                    <div className="flex items-center gap-[11px]">
                      <Avatar
                        initials={review.initials}
                        size="md"
                        className="!size-[36px] !bg-border-divider !bg-none text-[14px] font-semibold text-ink-secondary"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-ink-primary">{review.name}</p>
                        <p className="text-[12px] text-ink-muted">{review.date}</p>
                      </div>
                      <StarFillIcon size={13} />
                      <span className="text-[13px] font-semibold text-ink-primary">
                        {review.rating}
                      </span>
                    </div>
                    <p className="text-[14px] leading-[1.55] text-ink-secondary">{review.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="policies"
              className="scroll-mt-[calc(var(--spacing-header)+72px)] mt-[44px] pb-2xl"
            >
              <h2 className="text-heading-h2-section text-ink-primary">Policies</h2>
              <div className="mt-[18px] rounded-[18px] border border-border-default bg-surface-default px-[22px] py-sm text-[14px]">
                {POLICIES.map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={cn(
                      'flex gap-3xl py-lg',
                      i < arr.length - 1 && 'border-b border-border-divider',
                    )}
                  >
                    <p className="w-[200px] shrink-0 font-semibold text-ink-primary">{row.label}</p>
                    <p className="min-w-0 flex-1 leading-[1.5] text-ink-body">{row.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>

          <StickyCtaCard
            fromPrice={EVENT_DETAIL.fromPrice}
            note={EVENT_DETAIL.salesClose}
            tiers={EVENT_DETAIL.tiers}
            totals={EVENT_DETAIL.totals}
            total={EVENT_DETAIL.total}
            primaryLabel="Choose your seats"
            primaryTo={`/events/${slug ?? slugify(title)}/seats`}
            footerNote={EVENT_DETAIL.footerNote}
            aside={
              <>
                <StickyCtaResaleCard
                  title={EVENT_DETAIL.resale.title}
                  ends={EVENT_DETAIL.resale.ends}
                  body={EVENT_DETAIL.resale.body}
                  cta={EVENT_DETAIL.resale.cta}
                />
                <StickyCtaAssurances items={EVENT_DETAIL.assurances} />
              </>
            }
          />
        </div>
      </PageSection>

      <SimilarSection
        heading="You might also like"
        headingClassName="text-heading-h2-feature"
        link={{ label: 'All concerts in Riyadh', to: '/events' }}
      >
        {CATALOG_EVENTS.filter((e) => e.title !== title)
          .slice(0, 4)
          .map((event) => (
            <SimilarEventCard
              key={event.title}
              title={event.title}
              date={event.date}
              venue={event.venue}
              rating={event.rating}
              price={event.price}
              image={event.image}
            />
          ))}
      </SimilarSection>
    </>
  )
}

/**
 * Figma similar card `207:5148` — 315×~314, media 170, no catalog chrome
 * (no heart / badges / attendance). Kept local until a DS similar card exists.
 */
function SimilarEventCard({
  title,
  date,
  venue,
  rating,
  price,
  image,
}: {
  title: string
  date: string
  venue: string
  rating: string
  price: string
  image?: string
}) {
  return (
    <Link
      to={`/events/${slugify(title)}`}
      className="flex min-w-0 flex-col overflow-hidden rounded-[16px] border border-border-default bg-surface-default"
    >
      <div className="h-[170px] w-full overflow-hidden bg-bg-skeleton">
        {image ? (
          <img src={image} alt="" className="size-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-lg pt-[15px] pb-[16px]">
        <p className="text-[12px] font-semibold text-ink-muted">{date}</p>
        <p className="mt-[6px] text-[15px] leading-[1.25] font-semibold text-ink-primary">
          {title}
        </p>
        <p className="mt-[6px] text-[13px] text-ink-secondary">{venue}</p>
        <div className="mt-auto flex items-center justify-between pt-[12px]">
          <span className="flex items-center gap-[5px] text-[13px] font-medium text-ink-primary">
            <StarFillIcon size={13} />
            {rating}
          </span>
          <span className="text-[17px] font-semibold tabular-nums text-ink-primary">
            From {price}
          </span>
        </div>
      </div>
    </Link>
  )
}
