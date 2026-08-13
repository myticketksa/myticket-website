import { useParams } from 'react-router-dom'
import { EventCard, TalentDirectoryCard } from '@/components/cards'
import { StarFillIcon, VerifiedIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/navigation'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import {
  CATALOG_EVENTS,
  CATALOG_TALENTS,
  DetailGallery,
  LinkedCard,
  SimilarSection,
  slugify,
  StickyCtaCard,
  TALENT_DETAIL_GALLERY,
  TALENT_SIMILAR_IMAGES,
} from '@/pages/_guest'

/** Talent detail — Figma `207:5726`. */
export function TalentDetailPage() {
  const { slug } = useParams()
  const talent =
    CATALOG_TALENTS.find((t) => slugify(t.name) === slug) ?? CATALOG_TALENTS[0]

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Talents', href: '/talents' },
            { label: talent.name },
          ]}
        />
      </PageSection>

      <PageSection padTop={16} padBottom={0}>
        <DetailGallery
          category={talent.discipline.split(' · ')[0]}
          moreLabel="+8 photos"
          mainImage={TALENT_DETAIL_GALLERY.main}
          thumbs={TALENT_DETAIL_GALLERY.thumbs}
        />
      </PageSection>

      <PageSection padTop={34} padBottom={0}>
        <div className="flex items-start gap-[48px]">
          <article className="min-w-0 flex-1">
            <div className="flex items-center gap-[8px]">
              <h1 className="text-display-hero text-ink-primary">{talent.name}</h1>
              {talent.verified && <VerifiedIcon size={28} />}
            </div>
            <p className="mt-[10px] text-[17px] text-ink-secondary">{talent.discipline}</p>
            <div className="mt-[14px] flex flex-wrap items-center gap-[18px] text-[15px]">
              <span className="flex items-center gap-[5px] font-semibold text-ink-primary">
                <StarFillIcon size={15} />
                {talent.rating} · {talent.meta}
              </span>
            </div>
            <div className="mt-[22px] flex gap-row-gap">
              <Button>Get tickets</Button>
              <Button variant="secondary">Follow</Button>
              <Button variant="secondary">Share</Button>
            </div>

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">About</h2>
            <p className="mt-[18px] max-w-[720px] text-[16px] leading-[1.6] text-ink-secondary">
              {talent.name} is a verified MyTicket talent with upcoming appearances across
              Saudi Arabia. Book tickets for their next show, or enquire about a private booking
              through the marketplace.
            </p>

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">
              Upcoming shows
            </h2>
            <div className="mt-[18px] grid grid-cols-1 gap-5 sm:grid-cols-2">
              {CATALOG_EVENTS.slice(0, 4).map((event) => (
                <LinkedCard key={event.title} to={`/events/${slugify(event.title)}`}>
                  <EventCard {...event} context="catalog" />
                </LinkedCard>
              ))}
            </div>
          </article>

          <StickyCtaCard
            fromLabel="Tickets from"
            fromPrice="SAR 120"
            note={talent.nextShow?.headline}
            primaryLabel="Get tickets"
            secondaryLabel="Enquire to book"
          >
            <p className="mt-[18px] text-[14px] leading-[1.5] text-ink-secondary">
              {talent.nextShow?.detail ??
                'Next show details publish as soon as the organizer confirms the date.'}
            </p>
          </StickyCtaCard>
        </div>
      </PageSection>

      <SimilarSection heading="Similar talents" lede="More performers you may like.">
        {CATALOG_TALENTS.filter((t) => t.name !== talent.name)
          .slice(0, 4)
          .map((t, i) => (
            <LinkedCard key={t.name} to={`/talents/${slugify(t.name)}`}>
              <TalentDirectoryCard
                {...t}
                image={TALENT_SIMILAR_IMAGES[i] ?? t.image}
              />
            </LinkedCard>
          ))}
      </SimilarSection>
    </>
  )
}
