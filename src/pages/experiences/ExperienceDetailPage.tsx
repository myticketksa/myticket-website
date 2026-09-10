import { useParams } from 'react-router-dom'
import { ExperienceCard } from '@/components/cards'
import { StarFillIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/navigation'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import {
  CATALOG_EXPERIENCES,
  DetailGallery,
  EXPERIENCE_DETAIL_GALLERY,
  EXPERIENCE_DETAIL_MAP,
  EXPERIENCE_DETAIL_NEARBY,
  LinkedCard,
  SimilarSection,
  slugify,
  StickyCtaCard,
} from '@/pages/_guest'

/** Experience detail — Figma `207:7048`. */
export function ExperienceDetailPage() {
  const { slug } = useParams()
  const experience =
    CATALOG_EXPERIENCES.find((e) => slugify(e.title) === slug) ?? CATALOG_EXPERIENCES[0]

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Experiences', href: '/experiences' },
            { label: experience.title },
          ]}
        />
      </PageSection>

      <PageSection padTop={16} padBottom={0}>
        <DetailGallery
          category={experience.meta.split(' · ')[0]}
          moreLabel="+24 photos"
          mainImage={EXPERIENCE_DETAIL_GALLERY.main}
          thumbs={EXPERIENCE_DETAIL_GALLERY.thumbs}
        />
      </PageSection>

      <PageSection padTop={34} padBottom={0}>
        <div className="flex items-start gap-[48px]">
          <article className="min-w-0 flex-1">
            <p className="text-label-overline text-ink-brand-mid">{experience.meta}</p>
            <h1 className="text-display-hero mt-sm text-ink-primary">{experience.title}</h1>
            <div className="mt-[14px] flex flex-wrap items-center gap-[18px] text-[15px]">
              <span className="flex items-center gap-[5px] font-semibold text-ink-primary">
                <StarFillIcon size={15} />
                {experience.rating}
              </span>
              <span className="text-ink-secondary">{experience.place}</span>
              <span className="text-ink-secondary">Up to 12 guests</span>
            </div>
            <div className="mt-[22px] flex gap-row-gap">
              <Button variant="secondary" disabled title="Save requires an account">
                Save
              </Button>
              <Button variant="secondary" disabled title="Share not available yet">
                Share
              </Button>
            </div>

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">About</h2>
            <p className="mt-[18px] max-w-[720px] text-[16px] leading-[1.6] text-ink-secondary">
              A hosted experience on MyTicket — small groups, verified hosts, and clear
              cancellation. Meet at the published pickup point; transfers and equipment are
              included unless noted otherwise.
            </p>

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">What’s included</h2>
            <ul className="mt-[18px] max-w-[720px] list-disc space-y-sm pl-xl text-[15px] text-ink-secondary">
              <li>Licensed local host and safety briefing</li>
              <li>Transport from the city meeting point</li>
              <li>Light refreshments during the experience</li>
              <li>Free cancellation up to 48 hours before start</li>
            </ul>

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">Meeting point</h2>
            <div className="mt-[18px] overflow-hidden rounded-[18px] border border-border-default">
              <div className="relative h-[220px] w-full overflow-hidden">
                <img
                  src={EXPERIENCE_DETAIL_MAP}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-lg px-lg py-md">
                <p className="text-[14px] text-ink-secondary">{experience.place}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(experience.place)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-[36px] items-center rounded-[18px] border-[1.5px] border-border-default bg-surface-default px-lg text-[13px] font-semibold text-ink-primary hover:border-border-brand hover:text-ink-brand"
                >
                  Open in maps
                </a>
              </div>
            </div>
          </article>

          <StickyCtaCard
            fromLabel="From"
            fromPrice={experience.price}
            note="Per guest · select a date to confirm"
            primaryLabel="Check availability"
            secondaryLabel="Ask the host"
            secondaryTo="/support/new"
          />
        </div>
      </PageSection>

      <SimilarSection heading="Similar experiences">
        {CATALOG_EXPERIENCES.filter((e) => e.title !== experience.title)
          .slice(0, 4)
          .map((exp, i) => (
            <LinkedCard key={exp.title} to={`/experiences/${slugify(exp.title)}`}>
              <ExperienceCard
                title={exp.title}
                location={exp.location}
                tags={exp.tags}
                context="catalog"
                rating={exp.rating}
                guests={exp.guests}
                price={exp.price}
                image={i === 0 ? EXPERIENCE_DETAIL_NEARBY : exp.image}
              />
            </LinkedCard>
          ))}
      </SimilarSection>
    </>
  )
}
