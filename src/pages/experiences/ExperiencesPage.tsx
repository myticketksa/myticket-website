import { useState } from 'react'
import { ExperienceCard } from '@/components/cards'
import { FilterChip } from '@/components/data-display'
import { MinusIcon, PlusIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/navigation'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import {
  CATALOG_EXPERIENCES,
  CatalogPageHead,
  LinkedCard,
  PromoBand,
  slugify,
} from '@/pages/_guest'

const CATEGORIES = [
  'All experiences',
  'Food & desert',
  'Culture',
  'Heritage',
  'Outdoors',
  'Workshops',
  'Music',
] as const

/** Experiences directory — Figma `207:6795`. */
export function ExperiencesPage() {
  const [category, setCategory] = useState('All experiences')
  const [guests, setGuests] = useState(2)

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Experiences' },
          ]}
        />
      </PageSection>

      <PageSection padTop={14} padBottom={0}>
        <CatalogPageHead
          title="Experiences, not just seats"
          subtitle="Small-group things to do with a time slot and a guide — desert dinners, heritage walks, studio sessions. Pick a date, pick a time, done in three taps."
        />

        <div className="mt-3xl flex h-[72px] w-full items-center rounded-[18px] border border-border-default bg-surface-default px-[14px]">
          <div className="min-w-0 flex-1 px-sm">
            <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
              Where
            </p>
            <p className="mt-[3px] text-[15px] font-semibold text-ink-primary">
              Anywhere in Saudi Arabia
            </p>
          </div>
          <div className="mx-[2px] h-[34px] w-px bg-border-divider" />
          <div className="min-w-0 flex-1 px-sm">
            <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
              When
            </p>
            <p className="mt-[3px] text-[15px] font-semibold text-ink-muted">dd/mm/yyyy</p>
          </div>
          <div className="mx-[2px] h-[34px] w-px bg-border-divider" />
          <div className="w-[200px] shrink-0 px-sm">
            <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
              Guests
            </p>
            <div className="mt-[3px] flex items-center gap-[12px]">
              <button
                type="button"
                aria-label="Fewer guests"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                className="flex size-[26px] items-center justify-center rounded-full border border-border-default"
              >
                <MinusIcon size={14} />
              </button>
              <span className="text-[15px] font-semibold tabular-nums">{guests}</span>
              <button
                type="button"
                aria-label="More guests"
                onClick={() => setGuests((g) => g + 1)}
                className="flex size-[26px] items-center justify-center rounded-full border border-border-default"
              >
                <PlusIcon size={14} />
              </button>
            </div>
          </div>
          <Button className="h-[48px] w-[104px] shrink-0 rounded-[24px]">Search</Button>
        </div>

        <div className="mt-xl flex flex-wrap gap-[9px]">
          {CATEGORIES.map((label) => (
            <FilterChip
              key={label}
              selected={label === category}
              onClick={() => setCategory(label)}
            >
              {label}
            </FilterChip>
          ))}
        </div>
      </PageSection>

      <PageSection padTop={18} padBottom={0}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATALOG_EXPERIENCES.slice(0, 8).map((exp) => (
            <LinkedCard key={exp.title} to={`/experiences/${slugify(exp.title)}`}>
              <ExperienceCard
                context="catalog"
                title={exp.title}
                location={exp.location}
                eyebrow={exp.meta}
                rating={exp.rating}
                guests={exp.guests}
                price={exp.price}
                flag={'flag' in exp ? exp.flag : undefined}
                image={exp.image}
              />
            </LinkedCard>
          ))}
        </div>
      </PageSection>

      <PageSection padTop={88} padBottom={96}>
        <PromoBand
          tone="surface"
          heading="Host an experience"
          body="If you know a place, a craft or a route worth sharing, set your slots and group size and start taking bookings this week."
          ctaLabel="Become a host"
          ctaTo="/submit-experience"
        />
      </PageSection>
    </>
  )
}
