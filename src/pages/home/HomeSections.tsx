import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AuctionCard,
  EventCard,
  ExperienceCard,
  FeaturedPanelCard,
  TalentCard,
} from '@/components/cards'
import { CategoryChip } from '@/components/data-display'
import { ArrowRightIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { slugify } from '@/pages/_guest'
import ctaBand from '@/assets/home/cta-band.jpg'
import driftBlob from '@/assets/home/drift-blob.svg'
import {
  HOME_AUCTIONS,
  HOME_CATEGORIES,
  HOME_EVENTS,
  HOME_EVENT_TABS,
  HOME_EXPERIENCES,
  HOME_FEATURED_PANELS,
  HOME_TALENTS,
  type HomeEventWindow,
} from './home-data'
import {
  HOME_EVENT_IMAGES,
  HOME_EXPERIENCE_IMAGES,
  HOME_FEATURED_PANEL_IMAGES,
  HOME_TALENT_IMAGES,
} from './home-media'
import { HomeSectionHeader } from './HomeSectionHeader'
import { HomeTimeTabs } from './HomeTimeTabs'

/** Limited public talent strip — avatar, name, discipline, rating only. */
export function HomeTalents() {
  return (
    <PageSection padTop={84} padBottom={0}>
      <HomeSectionHeader
        overline="Who's performing"
        overlineTone="brand"
        heading="Artists on stage this season"
        lede="Follow a singer, band or comedian and see every date they play — then get your tickets for the night that suits you."
        link={{ label: 'Browse all talents', to: '/talents' }}
      />
      <div className="mt-[26px] grid grid-cols-2 gap-[18px] md:grid-cols-3 lg:grid-cols-5">
        {HOME_TALENTS.map((talent, i) => (
          <Link
            key={talent.name}
            to={`/talents/${slugify(talent.name)}`}
            className="min-w-0"
          >
            <TalentCard
              name={talent.name}
              discipline={talent.discipline}
              rating={talent.rating}
              reviews={talent.reviews}
              city={talent.city}
              verified={talent.verified}
              image={HOME_TALENT_IMAGES[i]}
              limited
            />
          </Link>
        ))}
      </div>
    </PageSection>
  )
}

/**
 * Figma `207:4434` — pad-top 72, CategoryChip row.
 * Chips overflow the 1320 band and clip at the page shell edge — no scrollbar
 * (Figma `207:4446` is a static clipped row; "Full taxonomy" is the overflow exit).
 */
export function HomeCategories() {
  return (
    <PageSection padTop={72} padBottom={0}>
      <HomeSectionHeader
        overline="What's on"
        heading="Browse by category"
        lede="Seventeen categories, from stadium football to heritage walks."
        ledeMaxWidth={null}
        link={{ label: 'Full taxonomy', to: '/events' }}
      />
      <div className="mt-[22px] -mr-page-gutter overflow-hidden">
        <div className="flex gap-[9px] pr-page-gutter">
          {HOME_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.label}
              href={`/events?category=${encodeURIComponent(cat.label)}`}
              count={cat.count}
              className="shrink-0"
            >
              {cat.label}
            </CategoryChip>
          ))}
        </div>
      </div>
    </PageSection>
  )
}

function matchesEventWindow(
  window: HomeEventWindow,
  tab: (typeof HOME_EVENT_TABS)[number],
) {
  if (tab === 'All') return true
  if (tab === 'Today') return window === 'today'
  if (tab === 'This weekend') return window === 'weekend'
  if (tab === 'This week') return window === 'week' || window === 'weekend' || window === 'today'
  if (tab === 'This month') return true
  return true
}

/** Figma `207:4459` — pad-top 60, time tabs + 2×4 EventCard Home. */
export function HomeEvents() {
  const [tab, setTab] = useState<(typeof HOME_EVENT_TABS)[number]>('All')
  const filtered = useMemo(
    () => HOME_EVENTS.filter((event) => matchesEventWindow(event.window, tab)),
    [tab],
  )

  return (
    <PageSection padTop={60} padBottom={0}>
      <HomeSectionHeader
        overline="On sale now"
        heading="Upcoming events"
        lede={`${filtered.length} of 1,284 events · updated a moment ago`}
        trailing={<HomeTimeTabs value={tab} onChange={setTab} />}
      />
      <div className="mt-[22px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((event) => {
          const i = HOME_EVENTS.findIndex((e) => e.title === event.title)
          return (
            <Link
              key={event.title}
              to={`/events/${slugify(event.title)}`}
              className="min-w-0"
            >
              <EventCard
                context="home"
                date={event.date}
                title={event.title}
                venue={event.venue}
                rating={event.rating}
                attendance={event.attendance}
                price={event.price}
                category={event.category}
                flag={'flag' in event ? event.flag : undefined}
                image={HOME_EVENT_IMAGES[i]}
              />
            </Link>
          )
        })}
      </div>
    </PageSection>
  )
}

/**
 * Figma `207:4490` — pad-top 76. Pastel panel (radius 28) with a local 46px heading —
 * not `HomeSectionHeader` / `SectionHeader` — plus 3× FeaturedPanelCard.
 */
export function HomeFeatured() {
  return (
    <PageSection padTop={76} padBottom={0}>
      <div
        className="relative flex flex-col gap-[28px] overflow-hidden rounded-[28px] border border-[#f7dfd3] bg-home-featured px-[46px] pt-[46px] pb-[50px]"
      >
        <img
          src={driftBlob}
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-[-181px] right-[-21px] size-[520px]"
        />

        <div className="relative flex items-end justify-between gap-4xl">
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="text-label-overline text-brand-gradient-end uppercase">
              Curated by MyTicket
            </p>
            <h2 className="text-heading-h1 mt-[10px] text-ink-primary">Featured events</h2>
          </div>
          <Link
            to="/events?featured=1"
            className="relative flex shrink-0 items-center gap-[5px] text-[14px] font-bold text-brand-gradient-end"
          >
            See the full selection
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-3">
          {HOME_FEATURED_PANELS.map((panel, i) => (
            <Link
              key={panel.title}
              to={`/events/${slugify(panel.title)}`}
              className="min-w-0"
            >
              <FeaturedPanelCard
                {...panel}
                image={HOME_FEATURED_PANEL_IMAGES[i]}
              />
            </Link>
          ))}
        </div>
      </div>
    </PageSection>
  )
}

/** Figma `207:4505` — pad-top 88, 4× AuctionCard. */
export function HomeAuctions() {
  return (
    <PageSection padTop={88} padBottom={0}>
      <HomeSectionHeader
        overline="Resale auction"
        heading="Tickets ending soonest"
        lede="Real tickets, transferred to you by their owner. MyTicket handles the money and takes a 10% commission from the seller."
        ledeMaxWidth={560}
        link={{ label: 'All auction listings', to: '/auctions' }}
      />
      <div className="mt-[22px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_AUCTIONS.map((auction) => (
          <Link
            key={auction.title}
            to={`/auctions/${slugify(auction.title)}`}
            className="min-w-0"
          >
            <AuctionCard {...auction} className="h-[214px]" />
          </Link>
        ))}
      </div>
    </PageSection>
  )
}

/** Figma `207:4522` — pad-top 88, 4× ExperienceCard Home. */
export function HomeExperiences() {
  return (
    <PageSection padTop={88} padBottom={0}>
      <HomeSectionHeader
        overline="Open year-round"
        heading="Experiences & destinations"
        lede="Places worth the drive — open now, all year round."
        ledeMaxWidth={null}
        link={{ label: 'Browse all experiences', to: '/experiences' }}
      />
      <div className="mt-[22px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_EXPERIENCES.map((experience, i) => (
          <Link
            key={experience.title}
            to={`/experiences/${slugify(experience.title)}`}
            className="min-w-0"
          >
            <ExperienceCard
              context="home"
              {...experience}
              image={HOME_EXPERIENCE_IMAGES[i]}
            />
          </Link>
        ))}
      </div>
    </PageSection>
  )
}

/**
 * Figma `207:4579` — pad-top 96. Radius-28 band with brand gradient, photo overlay,
 * dark left wash, Display/CTA 50px, white + outline h52 pills.
 */
export function HomeCta() {
  const navigate = useNavigate()

  return (
    <PageSection padTop={96} padBottom={0}>
      <div className="relative overflow-hidden rounded-[28px]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(153deg, var(--color-brand-gradient-start) 13%, var(--color-ink-brand) 50%, var(--color-ink-brand-strong) 87%)',
          }}
        />
        <img
          src={ctaBand}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover opacity-90 mix-blend-overlay"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(121deg, color-mix(in srgb, var(--color-ink-primary) 90%, transparent) 29%, color-mix(in srgb, var(--color-ink-brand-strong) 42%, transparent) 93%)',
          }}
        />

        <div className="relative flex max-w-[772px] flex-col px-[56px] py-[70px]">
          <h2 className="text-display-cta text-ink-inverse">
            Create an account and keep every ticket in one place.
          </h2>
          <p className="mt-lg text-[17px] leading-[1.55] font-medium text-ink-inverse">
            Save what you like, get told when tickets drop, hold your wallet balance and
            cashback, and carry your QR codes with you.
          </p>
          <div className="mt-[30px] flex flex-wrap gap-md">
            <Button
              size="lg"
              className="h-[52px] rounded-[26px] bg-surface-default px-[28px] text-[15px] font-bold text-ink-primary hover:bg-surface-default"
              onClick={() => navigate('/register')}
            >
              Create a free account
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-[52px] rounded-[26px] border-[1.5px] border-ink-inverse bg-transparent px-[28px] text-[15px] font-bold text-ink-inverse hover:border-ink-inverse hover:text-ink-inverse"
              onClick={() => navigate('/sign-in')}
            >
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </PageSection>
  )
}

/** Guest business strip — partnerships + Vendor/Talent submit forms (no marketplace). */
export function HomeBusinessStrip() {
  return (
    <PageSection padTop={72} padBottom={96}>
      <div className="flex flex-col items-start gap-lg overflow-hidden rounded-[16px] border border-border-default bg-surface-default px-2xl py-lg sm:flex-row sm:items-center">
        <p className="min-w-0 flex-1 text-[14px] leading-normal text-ink-muted">
          <span className="font-bold text-ink-primary">Working behind the ticket?</span>
          <span className="text-ink-secondary">
            {' '}
            Organizers partner with us through the office. Talents and vendors can submit a
            request from their guest account — we review and follow up outside the app.
          </span>
        </p>
        <div className="flex shrink-0 flex-wrap gap-lg text-[13.5px] font-bold text-brand-identity-end">
          <Link to="/for-organizers">For organizers</Link>
          <Link to="/for-talents">For talents</Link>
          <Link to="/for-vendors">For vendors</Link>
        </div>
      </div>
    </PageSection>
  )
}
