import { Link, useNavigate } from 'react-router-dom'
import {
  AuctionCard,
  EventCard,
  ExperienceCard,
  FeaturedPanelCard,
  OrganizerCard,
  TalentCard,
  VendorCard,
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
  HOME_EXPERIENCES,
  HOME_FEATURED_PANELS,
  HOME_ORGANIZERS,
  HOME_TALENTS,
  HOME_VENDORS,
} from './home-data'
import {
  HOME_EVENT_IMAGES,
  HOME_EXPERIENCE_IMAGES,
  HOME_FEATURED_PANEL_IMAGES,
  HOME_ORGANIZER_AVATARS,
  HOME_TALENT_IMAGES,
  HOME_VENDOR_IMAGES,
} from './home-media'
import { HomeSectionHeader } from './HomeSectionHeader'
import { HomeTimeTabs } from './HomeTimeTabs'

/** Figma `207:4416` — pad-top 84, 5× TalentCard Home, gap 18. */
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
            <TalentCard {...talent} image={HOME_TALENT_IMAGES[i]} />
          </Link>
        ))}
      </div>
    </PageSection>
  )
}

/** Figma `207:4434` — pad-top 72, CategoryChip row (may overflow). */
export function HomeCategories() {
  return (
    <PageSection padTop={72} padBottom={0}>
      <HomeSectionHeader
        overline="What's on"
        heading="Browse by category"
        lede="Seventeen categories, from stadium football to heritage walks."
        link={{ label: 'Full taxonomy', to: '/events' }}
      />
      <div className="mt-[22px] flex gap-[9px] overflow-x-auto pb-xs">
        {HOME_CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat.label}
            href={`/events?category=${encodeURIComponent(cat.label)}`}
            count={cat.count}
          >
            {cat.label}
          </CategoryChip>
        ))}
      </div>
    </PageSection>
  )
}

/** Figma `207:4459` — pad-top 60, time tabs + 2×4 EventCard Home. */
export function HomeEvents() {
  return (
    <PageSection padTop={60} padBottom={0}>
      <HomeSectionHeader
        overline="On sale now"
        heading="Upcoming events"
        lede="8 of 1,284 events · updated a moment ago"
        trailing={<HomeTimeTabs />}
      />
      <div className="mt-[22px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_EVENTS.map((event, i) => (
          <Link
            key={event.title}
            to={`/events/${slugify(event.title)}`}
            className="min-w-0"
          >
            <EventCard
              context="home"
              {...event}
              image={HOME_EVENT_IMAGES[i]}
            />
          </Link>
        ))}
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
        className="relative flex flex-col gap-[28px] overflow-hidden rounded-[28px] border border-border-default bg-home-featured px-[46px] pt-[46px] pb-[50px]"
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
        link={{ label: 'All auction listings', to: '/auctions' }}
      />
      <div className="mt-[22px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_AUCTIONS.map((auction) => (
          <Link
            key={auction.title}
            to={`/auctions/${slugify(auction.title)}`}
            className="min-w-0"
          >
            <AuctionCard {...auction} className="min-h-[214px]" />
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

/** Figma `207:4539` — pad-top 88, 6× OrganizerCard tile. */
export function HomeOrganizers() {
  return (
    <PageSection padTop={88} padBottom={0}>
      <HomeSectionHeader
        overline="Who's behind it"
        heading="Organizers to follow"
        lede="The people behind the biggest calendars in the Kingdom."
        link={{ label: 'Browse all organizers', to: '/organizers' }}
      />
      <div className="mt-[22px] grid grid-cols-2 gap-lg sm:grid-cols-3 lg:grid-cols-6">
        {HOME_ORGANIZERS.map((org, i) => (
          <Link
            key={org.name}
            to={`/organizers/${slugify(org.name)}`}
            className="min-w-0"
          >
            <OrganizerCard
              context="tile"
              {...org}
              avatar={HOME_ORGANIZER_AVATARS[i]}
              className="min-h-[222px]"
            />
          </Link>
        ))}
      </div>
    </PageSection>
  )
}

/** Figma `207:4558` — pad-top 88, 2×3 VendorCard row. */
export function HomeVendors() {
  return (
    <PageSection padTop={88} padBottom={0}>
      <HomeSectionHeader
        overline="Vendor marketplace"
        heading="Hosting something of your own?"
        lede="Caterers, photographers, decorators and crews you can message for a wedding, majlis or graduation night."
        link={{ label: 'Browse all vendors', to: '/vendors' }}
      />
      <div className="mt-[22px] grid grid-cols-1 gap-[18px] md:grid-cols-2 lg:grid-cols-3">
        {HOME_VENDORS.map((vendor, i) => (
          <Link
            key={vendor.name}
            to={`/vendors/${slugify(vendor.name)}`}
            className="min-w-0"
          >
            <VendorCard
              context="row"
              {...vendor}
              image={HOME_VENDOR_IMAGES[i]}
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
              'linear-gradient(121deg, rgba(25, 16, 8, 0.9) 29%, rgba(196, 51, 11, 0.42) 93%)',
          }}
        />

        <div className="relative flex max-w-[772px] flex-col px-[56px] py-[70px]">
          <h2 className="text-display-cta text-ink-inverse">
            Create an account and keep every ticket in one place.
          </h2>
          <p className="mt-lg max-w-[640px] text-[17px] leading-[1.55] font-medium text-ink-inverse">
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

/** Figma `207:4592` — pad 72 top / 96 bottom. Industry strip with three text links. */
export function HomeBusinessStrip() {
  return (
    <PageSection padTop={72} padBottom={96}>
      <div className="flex flex-col items-start gap-lg overflow-hidden rounded-[16px] border border-border-default bg-surface-default px-2xl py-lg sm:flex-row sm:items-center">
        <p className="min-w-0 flex-1 text-[14px] leading-normal text-ink-muted">
          <span className="font-bold text-ink-primary">On the other side of the ticket?</span>
          <span className="text-ink-secondary">
            {' '}
            Organize events, perform, or supply the crew — MyTicket is where the industry
            works too.
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
