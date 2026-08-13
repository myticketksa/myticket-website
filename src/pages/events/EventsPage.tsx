import { useState } from 'react'
import { EventCard } from '@/components/cards'
import { Breadcrumbs } from '@/components/navigation'
import { PageSection } from '@/layouts'
import { NumberedPagination } from '@/components/navigation'
import {
  AuctionBand,
  CatalogBody,
  CatalogPageHead,
  CatalogSaveAlertActions,
  CATALOG_EVENTS,
  EVENT_CATEGORY_CHIPS,
  FilterSidebar,
  LinkedCard,
  ResultsToolbar,
  slugify,
} from '@/pages/_guest'

/** Events directory — Figma `207:4600`. Chrome via MainLayout. */
export function EventsPage() {
  const [category, setCategory] = useState('Concerts')

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Events', href: '/events' },
            { label: category },
          ]}
        />
      </PageSection>

      <PageSection padTop={14} padBottom={0}>
        <CatalogPageHead
          title={`${category} in Saudi Arabia`}
          subtitle="168 concerts on sale — arena shows, festival stages and intimate nights, from Riyadh to Jazan."
          chips={EVENT_CATEGORY_CHIPS.map((label) => ({
            label,
            selected: label === category || (label === 'All events' && category === 'All events'),
          }))}
          onChipSelect={setCategory}
          actions={
            <CatalogSaveAlertActions alertLabel={`Alert me on new ${category.toLowerCase()}`} />
          }
        />
      </PageSection>

      <PageSection padTop={28} padBottom={0}>
        <CatalogBody filters={<FilterSidebar />}>
          <ResultsToolbar
            countLabel="9 of 168 events"
            activeFilter={category === 'All events' ? undefined : category}
            onClearFilter={() => setCategory('All events')}
          />
          <div className="mt-lg grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATALOG_EVENTS.slice(0, 9).map((event) => (
              <LinkedCard key={event.title} to={`/events/${slugify(event.title)}`}>
                <EventCard {...event} context="catalog" />
              </LinkedCard>
            ))}
          </div>
          <div className="mt-[36px]">
            <NumberedPagination pages={[1, 2, 3, 4, 19]} />
          </div>
        </CatalogBody>
      </PageSection>

      <AuctionBand />
    </>
  )
}
