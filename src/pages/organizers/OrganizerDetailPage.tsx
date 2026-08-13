import { useParams } from 'react-router-dom'
import { EventCard, OrganizerCard } from '@/components/cards'
import { CheckGlyphIcon, StarFillIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/navigation'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import {
  CATALOG_EVENTS,
  CATALOG_ORGANIZERS,
  LinkedCard,
  ORGANIZER_DETAIL_COVER,
  ORGANIZER_DETAIL_EVENT_IMAGES,
  ORGANIZER_DETAIL_MARK,
  SimilarSection,
  slugify,
  StickyCtaCard,
} from '@/pages/_guest'

/** Organizer detail — Figma `207:6154`. */
export function OrganizerDetailPage() {
  const { slug } = useParams()
  const organizer =
    CATALOG_ORGANIZERS.find((o) => slugify(o.name) === slug) ?? CATALOG_ORGANIZERS[0]

  const isFeaturedDetail = organizer.name === CATALOG_ORGANIZERS[0]?.name
  const cover = isFeaturedDetail ? ORGANIZER_DETAIL_COVER : organizer.cover
  const mark = isFeaturedDetail ? ORGANIZER_DETAIL_MARK : organizer.avatar

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Organizers', href: '/organizers' },
            { label: organizer.name },
          ]}
        />
      </PageSection>

      <PageSection padTop={16} padBottom={0}>
        <div className="relative h-[260px] overflow-hidden rounded-[18px]">
          <img src={cover} alt="" className="size-full object-cover" />
        </div>
        <div className="-mt-[36px] flex items-end gap-xl px-xl">
          <div className="size-[88px] overflow-hidden rounded-full border-[4px] border-bg-page bg-bg-skeleton">
            <img src={mark} alt="" className="size-full object-cover" />
          </div>
          <div className="pb-sm">
            <div className="flex items-center gap-[8px]">
              <h1 className="text-heading-h1 text-ink-primary">{organizer.name}</h1>
              {organizer.verified && <CheckGlyphIcon size={22} className="text-ink-brand" />}
            </div>
            <p className="mt-[4px] text-[15px] text-ink-secondary">{organizer.category}</p>
          </div>
        </div>
      </PageSection>

      <PageSection padTop={34} padBottom={0}>
        <div className="flex items-start gap-[48px]">
          <article className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-[18px] text-[15px] text-ink-muted">
              <p>
                <span className="font-semibold text-ink-primary">{organizer.events}</span>{' '}
                events
              </p>
              <p>
                <span className="font-semibold text-ink-primary">{organizer.followers}</span>{' '}
                followers
              </p>
              <span className="flex items-center gap-[5px]">
                <StarFillIcon />
                {organizer.rating}
              </span>
            </div>
            <div className="mt-[22px] flex gap-row-gap">
              <Button>Follow</Button>
              <Button variant="secondary">Share</Button>
            </div>

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">About</h2>
            <p className="mt-[18px] max-w-[720px] text-[16px] leading-[1.6] text-ink-secondary">
              {organizer.name} publishes seasons and one-off nights on MyTicket. Follow for
              early access when tickets drop, and browse their live calendar below.
            </p>

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">
              Upcoming events
            </h2>
            <div className="mt-[18px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CATALOG_EVENTS.slice(0, 6).map((event, i) => (
                <LinkedCard key={event.title} to={`/events/${slugify(event.title)}`}>
                  <EventCard
                    {...event}
                    context="catalog"
                    image={ORGANIZER_DETAIL_EVENT_IMAGES[i] ?? event.image}
                  />
                </LinkedCard>
              ))}
            </div>
          </article>

          <StickyCtaCard
            fromLabel="Followers"
            fromPrice={organizer.followers}
            note={`${organizer.events} events on sale`}
            primaryLabel="Follow organizer"
            secondaryLabel="Browse all events"
          />
        </div>
      </PageSection>

      <SimilarSection heading="Similar organizers">
        {CATALOG_ORGANIZERS.filter((o) => o.name !== organizer.name)
          .slice(0, 4)
          .map((o) => (
            <LinkedCard key={o.name} to={`/organizers/${slugify(o.name)}`}>
              <OrganizerCard {...o} context="directory" />
            </LinkedCard>
          ))}
      </SimilarSection>
    </>
  )
}
