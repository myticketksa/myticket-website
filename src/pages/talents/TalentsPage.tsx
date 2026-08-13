import { useState } from 'react'
import { TalentCard, TalentDirectoryCard } from '@/components/cards'
import { FilterChip } from '@/components/data-display'
import { Checkbox } from '@/components/ui'
import { PageSection } from '@/layouts'
import {
  BusinessStrip,
  CatalogBody,
  CatalogPageHead,
  CatalogPager,
  CATALOG_TALENTS,
  CITY_FACETS,
  FilterSidebar,
  HOME_TALENTS,
  LinkedCard,
  PromoBand,
  RATING_OPTIONS,
  ResultsToolbar,
  slugify,
  TALENT_WEEK_IMAGES,
} from '@/pages/_guest'

const TALENT_CHIPS = [
  'All talents',
  'Singers',
  'Bands',
  'DJs',
  'Musicians',
  'Speakers',
  'Comedians',
  'Hosts',
  'Dance troupes',
] as const

/** Talents directory — Figma `207:5539`. */
export function TalentsPage() {
  const [chip, setChip] = useState('All talents')

  return (
    <>
      <PageSection padTop={14} padBottom={0}>
        <CatalogPageHead
          eyebrow="Who's performing"
          title="Follow the artists, catch every show"
          subtitle="Bookable performers with upcoming shows — singers, DJs, comics and speakers ready for your night."
          chips={TALENT_CHIPS.map((label) => ({
            label,
            selected: label === chip,
          }))}
          onChipSelect={setChip}
        />
      </PageSection>

      <PageSection padTop={30} padBottom={0}>
        <div className="mb-[18px] flex items-end justify-between gap-4xl">
          <div>
            <h2 className="text-heading-h2 text-ink-primary">Playing this week</h2>
            <p className="mt-sm text-body-default text-ink-secondary">
              Tickets are on sale now for all four.
            </p>
          </div>
          <a
            href="#directory"
            className="flex items-center gap-[5px] text-[14px] font-bold text-ink-brand-mid"
          >
            All events this week →
          </a>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_TALENTS.slice(0, 4).map((talent, i) => (
            <LinkedCard key={talent.name} to={`/talents/${slugify(talent.name)}`}>
              <TalentCard {...talent} image={TALENT_WEEK_IMAGES[i]} />
            </LinkedCard>
          ))}
        </div>
      </PageSection>

      <PageSection padTop={44} padBottom={0} id="directory">
        <CatalogBody
          filterWidth={252}
          filters={
            <FilterSidebar title="Narrow it down" clearLabel="Clear" width={252}>
              <div className="flex w-full flex-col gap-[22px]">
                <div>
                  <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                    When
                  </p>
                  <div className="mt-md flex flex-col gap-[7px]">
                    {['Anytime', 'This week', 'This month', 'Next 3 months'].map((label, i) => (
                      <FilterChip
                        key={label}
                        selected={i === 0}
                        className="h-[36px] w-full justify-start rounded-[9px] px-md text-[14px]"
                      >
                        {label}
                      </FilterChip>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-border-divider" />
                <div>
                  <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                    Playing in
                  </p>
                  <div className="mt-md flex flex-col gap-[9px]">
                    {CITY_FACETS.slice(0, 5).map((c, i) => (
                      <Checkbox
                        key={c.label}
                        id={`talent-city-${i}`}
                        label={c.label}
                        count={c.count}
                        fullWidth
                      />
                    ))}
                  </div>
                </div>
                <div className="h-px bg-border-divider" />
                <div>
                  <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                    Rating
                  </p>
                  <div className="mt-md flex flex-wrap gap-[7px]">
                    {RATING_OPTIONS.map((opt, i) => (
                      <FilterChip
                        key={opt}
                        selected={i === 0}
                        className="h-[32px] rounded-[16px] px-md text-[13px] font-semibold"
                      >
                        {opt}
                      </FilterChip>
                    ))}
                  </div>
                </div>
              </div>
            </FilterSidebar>
          }
        >
          <ResultsToolbar
            countLabel="9 of 412 talents"
            sortValue="Playing soonest"
            showViewToggle={false}
          />
          <div className="mt-[18px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {CATALOG_TALENTS.slice(0, 9).map((talent) => (
              <LinkedCard key={talent.name} to={`/talents/${slugify(talent.name)}`}>
                <TalentDirectoryCard {...talent} />
              </LinkedCard>
            ))}
          </div>
          <div className="mt-[36px]">
            <CatalogPager pages={[1, 2, 3, 4, 46]} />
          </div>
        </CatalogBody>
      </PageSection>

      <PageSection padTop={80} padBottom={0}>
        <PromoBand
          tone="surface"
          heading="Never miss a date"
          body="Get a push the moment a talent you follow announces a show — or drops a last-minute ticket."
          ctaLabel="Create your account →"
          ctaTo="/register"
        />
      </PageSection>

      <BusinessStrip
        heading="Are you a performer?"
        body="Apply once. Get discovered by organizers booking nights across the Kingdom."
        ctaLabel="Become a talent"
        ctaTo="/apply/talent"
      />
    </>
  )
}
