import { useState } from 'react'
import { OrganizerCard } from '@/components/cards'
import { Breadcrumbs } from '@/components/navigation'
import { Checkbox } from '@/components/ui'
import { PageSection } from '@/layouts'
import {
  BusinessStrip,
  CatalogBody,
  CatalogPageHead,
  CATALOG_ORGANIZERS,
  CITY_FACETS,
  FilterSidebar,
  LinkedCard,
  PromoBand,
  ResultsToolbar,
  slugify,
} from '@/pages/_guest'

const ORG_CHIPS = [
  'All',
  'Following',
  'Verified',
  'Riyadh',
  'Jeddah',
] as const

/** Organizers directory — Figma `207:6112`. */
export function OrganizersPage() {
  const [chip, setChip] = useState('All')

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Organizers' },
          ]}
        />
      </PageSection>

      <PageSection padTop={14} padBottom={0}>
        <CatalogPageHead
          title="Organizers to follow"
          subtitle="Follow the people behind the Kingdom's calendars and you'll hear about their on-sales before anyone else."
          chips={ORG_CHIPS.map((label) => ({
            label,
            selected: label === chip,
          }))}
          onChipSelect={setChip}
        />
      </PageSection>

      <PageSection padTop={34} padBottom={0}>
        <CatalogBody
          filterWidth={252}
          filters={
            <FilterSidebar title="Narrow it down" clearLabel="Clear" width={252}>
              <div className="flex w-full flex-col gap-[22px]">
                <div>
                  <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                    Based in
                  </p>
                  <div className="mt-md flex flex-col gap-[9px]">
                    {CITY_FACETS.slice(0, 5).map((c, i) => (
                      <Checkbox
                        key={c.label}
                        id={`org-city-${i}`}
                        label={c.label}
                        count={c.count}
                        fullWidth
                      />
                    ))}
                  </div>
                </div>
                <div className="h-px bg-border-divider" />
                <Checkbox id="org-verified" label="Verified organizers only" fullWidth />
              </div>
            </FilterSidebar>
          }
        >
          <ResultsToolbar
            countLabel="6 of 94 organizers"
            sortValue="Most followed"
            showViewToggle={false}
          />
          <div className="mt-[18px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {CATALOG_ORGANIZERS.map((org) => (
              <LinkedCard key={org.name} to={`/organizers/${slugify(org.name)}`}>
                <OrganizerCard {...org} context="directory" />
              </LinkedCard>
            ))}
          </div>
        </CatalogBody>
      </PageSection>

      <PageSection padTop={80} padBottom={0}>
        <PromoBand
          tone="surface"
          heading="Never miss a drop"
          body="Follow organizers and get notified the moment tickets go on sale — before the public push."
          ctaLabel="Create a free account"
          ctaTo="/register"
        />
      </PageSection>

      <BusinessStrip
        heading="Running events yourself?"
        body="List events, sell tickets and reach fans across Saudi Arabia on MyTicket."
        ctaLabel="Become an organizer →"
        ctaTo="/apply/organizer"
      />
    </>
  )
}
