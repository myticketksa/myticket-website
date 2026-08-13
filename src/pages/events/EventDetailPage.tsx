import { useParams } from 'react-router-dom'
import { EventCard } from '@/components/cards'
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
import {
  CATALOG_EVENTS,
  DetailGallery,
  DetailOrganizerBand,
  EVENT_DETAIL,
  EVENT_DETAIL_GALLERY,
  EVENT_DETAIL_VENUE_MAP,
  LinkedCard,
  SimilarSection,
  slugify,
  StickyCtaAssurances,
  StickyCtaCard,
  StickyCtaResaleCard,
} from '@/pages/_guest'

const TABS = ['About', 'Line-up', 'Venue', 'Reviews', 'Policies'] as const

/** Event detail — Figma `207:4797`. */
export function EventDetailPage() {
  const { slug } = useParams()
  const title =
    CATALOG_EVENTS.find((e) => slugify(e.title) === slug)?.title ?? EVENT_DETAIL.title

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
              >
                Save
              </Button>
              <Button
                variant="secondary"
                className="h-[40px] rounded-[20px] border px-lg"
                icon={<ArrowUpRightIcon size={16} />}
              >
                Share
              </Button>
              <Button
                variant="secondary"
                className="h-[40px] rounded-[20px] border px-lg"
                icon={<CalendarIcon size={16} />}
              >
                Add to calendar
              </Button>
            </div>

            <div className="mt-[34px]">
              <DetailSectionTabs aria-label="Event sections">
                {TABS.map((tab, i) => (
                  <DetailSectionTab key={tab} active={i === 0}>
                    {tab}
                  </DetailSectionTab>
                ))}
              </DetailSectionTabs>
            </div>

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

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">Line-up</h2>
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
                    <img
                      src={act.image}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="px-[14px] pt-[13px] pb-[15px]">
                    <p className="text-[15px] font-semibold text-ink-primary">{act.name}</p>
                    <p className="mt-[2px] text-[13px] text-ink-secondary">{act.role}</p>
                    <p className="mt-sm text-[12px] font-semibold text-ink-brand">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">
              Venue & getting there
            </h2>
            <div className="mt-[18px] overflow-hidden rounded-[18px] border border-border-default bg-surface-default">
              <div className="h-[260px] w-full overflow-hidden bg-bg-skeleton">
                <img
                  src={EVENT_DETAIL_VENUE_MAP}
                  alt="Map of King Abdullah Park, Al Malaz, Riyadh"
                  className="size-full object-cover"
                />
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

            <div className="mt-[44px] flex items-end justify-between gap-lg">
              <h2 className="text-heading-h2-section text-ink-primary">Reviews</h2>
              <div className="flex items-center gap-[5px] text-[15px] text-ink-secondary">
                <StarFillIcon size={15} />
                <span>{EVENT_DETAIL.reviewsSummary}</span>
              </div>
            </div>
            <div className="mt-[18px] grid grid-cols-1 gap-lg lg:grid-cols-3">
              {[
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
              ].map((review) => (
                <div
                  key={review.name}
                  className="flex flex-col gap-[11px] rounded-[16px] border border-border-default bg-surface-default p-[18px]"
                >
                  <div className="flex items-center gap-[11px]">
                    <div className="flex size-[36px] items-center justify-center rounded-[18px] bg-border-divider text-[14px] font-semibold text-ink-secondary">
                      {review.initials}
                    </div>
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

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">Policies</h2>
            <div className="mt-[18px] rounded-[18px] border border-border-default bg-surface-default px-[22px] py-sm text-[14px]">
              {[
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
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={`flex gap-3xl py-lg ${i < arr.length - 1 ? 'border-b border-border-divider' : ''}`}
                >
                  <p className="w-[200px] shrink-0 font-semibold text-ink-primary">{row.label}</p>
                  <p className="min-w-0 flex-1 leading-[1.5] text-ink-body">{row.body}</p>
                </div>
              ))}
            </div>
          </article>

          <StickyCtaCard
            fromPrice={EVENT_DETAIL.fromPrice}
            note={EVENT_DETAIL.salesClose}
            tiers={EVENT_DETAIL.tiers}
            totals={EVENT_DETAIL.totals}
            total={EVENT_DETAIL.total}
            primaryLabel="Choose your seats"
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
            <LinkedCard key={event.title} to={`/events/${slugify(event.title)}`}>
              <EventCard {...event} context="catalog" />
            </LinkedCard>
          ))}
      </SimilarSection>
    </>
  )
}
