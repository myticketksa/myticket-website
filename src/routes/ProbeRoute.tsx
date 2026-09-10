import { useState } from 'react'
import {
  AmountInput,
  Button,
  Checkbox,
  Field,
  OTPInput,
  Radio,
  RadioGroup,
  SearchField,
  Select,
  Textarea,
  TextInput,
  Toggle,
} from '@/components/ui'
import {
  Avatar,
  Countdown,
  CountBadge,
  Divider,
  FilterChip,
  ImagePlaceholder,
  MeterBar,
  OverlayBadge,
  PriceDisplay,
  CategoryChip,
  Skeleton,
  SkeletonStack,
  StarRating,
  StatusBadge,
  STATUS_TONES,
} from '@/components/data-display'
import { BellIcon, HeartIcon } from '@/components/icons'
import {
  AuctionCard,
  EventCard,
  ExperienceCard,
  FeaturedHeroCard,
  FeaturedPanelCard,
  LoadingCard,
  TalentCard,
  TalentDirectoryCard,
} from '@/components/cards'
import { SectionHeader } from '@/components/sections'
import {
  Breadcrumbs,
  NavItem,
  Pagination,
  SearchPill,
  SiteFooter,
  SiteHeader,
  Tab,
  TabList,
} from '@/components/navigation'
import {
  DeadlineBanner,
  EmptyState,
  Modal,
  Toast,
} from '@/components/feedback'

/**
 * Temporary visual harness for verifying token wiring during the build.
 * Delete once the real pages land.
 */
export function ProbeRoute() {
  const [otp, setOtp] = useState('')
  const [notify, setNotify] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState('upcoming')

  return (
    <div className="min-h-dvh bg-bg-page">
      <SiteHeader state="signedOut" />
      <SiteHeader
        state="signedIn"
        activeItem="Events"
        account={{ name: 'Sara', initials: 'SA', notifications: 3 }}
      />

      <div className="p-10">
      <h1 className="text-heading-h2 text-ink-primary">Button</h1>

      <div className="mt-8 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button size="lg">Save</Button>
          <Button size="md">Save</Button>
          <Button size="sm">Save</Button>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="lg">Save</Button>
          <Button variant="secondary" icon={<HeartIcon size={16} />}>Save</Button>
          <Button variant="ghost">Save</Button>
          <Button variant="destructive">Save</Button>
          <Button variant="icon" aria-label="Favourite">
            <HeartIcon size={18} />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Button disabled>Save</Button>
          <Button loading>Save</Button>
        </div>
      </div>

      <h2 className="text-heading-h2 mt-14 text-ink-primary">Type scale</h2>
      <div className="mt-6 flex flex-col gap-3">
        <p className="text-display-hero text-ink-primary">Display Hero</p>
        <p className="text-heading-h2-section text-ink-primary">Heading H2 Section</p>
        <p className="text-body-large text-ink-secondary">Body Large</p>
        <p className="text-numeric-default text-ink-brand">1,234 SAR</p>
        <p className="text-label-overline text-ink-brand-mid uppercase">Overline</p>
        <p className="text-label-table text-ink-muted">Table label</p>
      </div>

      <h2 className="text-heading-h2 mt-14 text-ink-primary">Fields</h2>
      <div className="mt-6 grid max-w-[680px] gap-6 md:grid-cols-2">
        <Field label="Email" htmlFor="email">
          <TextInput id="email" placeholder="e.g. sara@email.com" />
        </Field>
        <Field label="Mobile number" htmlFor="mobile" error="Enter a Saudi mobile number starting 05.">
          <TextInput
            id="mobile"
            invalid
            placeholder="5X XXX XXXX"
            leading={
              <>
                <span className="shrink-0 text-[15px] text-ink-secondary">+966</span>
                <span className="h-5 w-px shrink-0 bg-border-default" />
              </>
            }
          />
        </Field>
        <Field label="City" htmlFor="city">
          <Select id="city" defaultValue="riyadh">
            <option value="riyadh">Riyadh</option>
            <option value="jeddah">Jeddah</option>
          </Select>
        </Field>
        <Field label="Disabled" htmlFor="off">
          <TextInput id="off" disabled defaultValue="e.g. sara@email.com" />
        </Field>
        <Field
          className="md:col-span-2"
          label="Brief"
          htmlFor="brief"
          counter="0 / 600 · min 80 characters"
        >
          <Textarea id="brief" placeholder="Tell the vendor what you need, dates, and your budget…" />
        </Field>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-8">
        <SearchField className="w-[240px]" />
        <SearchField size="pill" className="w-[240px]" placeholder="Search" />
        <SearchField size="icon" />
        <AmountInput defaultValue="260" aria-label="Bid amount" />
      </div>

      <h2 className="text-heading-h2 mt-14 text-ink-primary">Controls</h2>
      <div className="mt-6 flex flex-col gap-5">
        <div className="flex max-w-[280px] flex-col gap-3">
          <Checkbox id="jeddah" label="Jeddah" count="238" fullWidth />
          <Checkbox id="riyadh" label="Riyadh" count="412" defaultChecked fullWidth />
        </div>
        <RadioGroup defaultValue="free" className="flex gap-8">
          <Radio value="free" id="free" label="Free seating" />
          <Radio value="seated" id="seated" label="Seated event" />
        </RadioGroup>
        <Toggle
          id="notify"
          label="Email me about price drops"
          checked={notify}
          onCheckedChange={setNotify}
        />
        <OTPInput value={otp} onChange={setOtp} />
      </div>

      <h2 className="text-heading-h2 mt-14 text-ink-primary">Status badges</h2>
      <div className="mt-6 flex max-w-[860px] flex-wrap items-center gap-3">
        {Object.entries(STATUS_TONES).map(([label, tone]) => (
          <StatusBadge key={label} tone={tone}>
            {label}
          </StatusBadge>
        ))}
      </div>

      <h2 className="text-heading-h2 mt-14 text-ink-primary">Chips and counts</h2>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <FilterChip>All events</FilterChip>
        <FilterChip selected>Concerts</FilterChip>
        <FilterChip count="412">Riyadh</FilterChip>
        <FilterChip removable onRemove={() => {}}>
          Under 200 SAR
        </FilterChip>
        <span className="relative inline-flex">
          <Button variant="icon" aria-label="Notifications">
            <BellIcon size={18} />
          </Button>
          <span className="absolute -top-1 -right-1">
            <CountBadge count={3} />
          </span>
        </span>
        <span className="relative inline-flex">
          <Button variant="icon" aria-label="Notifications">
            <BellIcon size={18} />
          </Button>
          <span className="absolute -top-[3px] -right-[3px]">
            <CountBadge count={12} platform="mobile" />
          </span>
        </span>
      </div>

      <h2 className="text-heading-h2 mt-14 text-ink-primary">Avatars, ratings, prices</h2>
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <Avatar initials="SA" />
        <Avatar initials="MK" size="lg" shape="squircle" />
        <StarRating />
        <StarRating form="inline">4.8 · 1.2k going</StarRating>
        <PriceDisplay>SAR 1,240.00</PriceDisplay>
        <PriceDisplay context="amount">SAR 260.00</PriceDisplay>
        <PriceDisplay context="stat">SAR 4,820.00</PriceDisplay>
        <Countdown urgent>00:41:22</Countdown>
        <Countdown>1d 04:22</Countdown>
      </div>

      <h2 className="text-heading-h2 mt-14 text-ink-primary">Meters, skeletons, media</h2>
      <div className="mt-6 grid max-w-[760px] gap-8 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <MeterBar value={0.78} label="Tickets sold" />
          <MeterBar value={0.15} label="Tickets sold" />
          <Divider />
          <Divider tone="border" />
        </div>
        <SkeletonStack>
          <Skeleton />
          <Skeleton variant="line" className="w-[70%]" />
          <Skeleton variant="line" className="w-[45%]" />
        </SkeletonStack>
        <div className="relative">
          <ImagePlaceholder ratio="16x10" caption="Event image" className="rounded-card" />
          <span className="absolute top-[10px] left-[10px]">
            <OverlayBadge>From SAR 180</OverlayBadge>
          </span>
          <span className="absolute top-[10px] right-[10px]">
            <OverlayBadge tone="success">Available</OverlayBadge>
          </span>
        </div>
      </div>

      <h2 className="text-heading-h2 mt-14 text-ink-primary">Cards</h2>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <CategoryChip href="#" count="214">
          Music
        </CategoryChip>
        <CategoryChip href="#" count="86">
          Theatre
        </CategoryChip>
      </div>

      <div className="mt-8 grid max-w-[1060px] items-start gap-6 md:grid-cols-3">
        <TalentCard
          name="Layal Qasim"
          discipline="Singer · Arabic pop"
          rating="4.9"
          reviews="128"
          city="Riyadh"
          nextLabel="Next · Thu 8 Oct"
          nextEvent="Riyadh Season Opening Night"
        />
        <EventCard
          date="Thu 8 Oct · 20:00"
          title="Winter Nights: Live at King Abdullah Park"
          venue="King Abdullah Park, Riyadh"
          rating="4.8"
          attendance="3,410 attending"
          price="SAR 180"
          category="Concerts"
          flag="Nearly sold out"
        />
        <EventCard
          context="catalog"
          date="Thu 8 Oct · 20:00"
          title="Winter Nights: Live at King Abdullah Park"
          venue="King Abdullah Park, Riyadh"
          rating="4.8"
          attendance="3,410 attending"
          price="SAR 180"
          category="Concerts"
          flag="Nearly sold out"
        />
      </div>

      <div className="mt-8 grid max-w-[1060px] items-start gap-6 md:grid-cols-3">
        <TalentDirectoryCard
          name="Layal Qasim"
          discipline="Singer · Arabic pop"
          meta="24.6k followers · 3 shows"
          rating="4.9"
          nextShow={{
            headline: 'Thu 8 Oct · Riyadh Season Opening Night',
            detail: 'Boulevard Arena · from SAR 180',
          }}
        />
        <LoadingCard footnote="Skeletons mirror final layout." />
      </div>

      <div className="mt-8 grid max-w-[1060px] items-start gap-6 md:grid-cols-3">
        <ExperienceCard
          title="Desert stargazing with a local astronomer"
          location="AlUla · 3 hours"
          tags={['Guided tours', 'Family']}
        />
        <ExperienceCard
          context="home"
          title="Desert stargazing with a local astronomer"
          location="From SAR 240"
          category="Outdoors"
          summary="A guided night in the AlUla desert with telescopes, tea and a very patient astronomer."
          rating="4.9"
          reviews="212"
        />
        <FeaturedPanelCard
          date="Fri 16 Oct · 21:00"
          title="Jeddah Season: Closing Night"
          venue="Jeddah Superdome"
          price="From SAR 320"
          meta="4.7 (1,204)"
        />
      </div>

      <div className="mt-8 grid max-w-[1060px] items-start gap-6 md:grid-cols-3">
        <FeaturedHeroCard
          date="Thu 8 Oct · 20:00"
          title="Winter Nights at King Abdullah Park"
          venue="King Abdullah Park"
          rating="4.8"
          price="SAR 180"
          category="Concerts"
          flag="Nearly sold out"
        />
        <div className="flex flex-col gap-6">
          <AuctionCard
            listings="12 listings"
            endsIn="Ends in 02:41:18"
            title="Front row · Winter Nights"
            meta="Row A · Seats 12–13"
            highestBid="SAR 1,240"
            buyNow="SAR 1,800"
          />
        </div>
      </div>

      <h2 className="text-heading-h2 mt-14 text-ink-primary">Section header</h2>
      <div className="mt-6 max-w-[1320px]">
        <SectionHeader
          overline="02 · Talents"
          heading="Artists guests follow"
          lede="Limited public profiles — avatar, name, craft and rating. Booking contact stays with MyTicket off-platform."
          link={{ label: 'See the full selection', href: '#' }}
        />
      </div>

      <h2 className="text-heading-h2 mt-14 text-ink-primary">Navigation</h2>
      <div className="mt-6 flex flex-col gap-8">
        <div className="flex flex-wrap items-center gap-6">
          <SearchPill className="w-[300px]" />
          <NavItem label="Events" href="#" state="default" />
          <NavItem label="Talents" href="#" state="active" />
          <NavItem label="Vendors" href="#" state="section" />
        </div>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '#' },
            { label: 'Events', href: '#' },
            { label: 'Winter Nights' },
          ]}
        />
        <TabList>
          <Tab label="Upcoming" count="12" active={tab === 'upcoming'} onClick={() => setTab('upcoming')} />
          <Tab label="Past" count="4" active={tab === 'past'} onClick={() => setTab('past')} />
          <Tab label="Cancelled" active={tab === 'cancelled'} onClick={() => setTab('cancelled')} />
        </TabList>
        <Pagination label="Show 24 more" counter="Showing 24 of 168" />
      </div>

      <h2 className="text-heading-h2 mt-14 text-ink-primary">Feedback</h2>
      <div className="mt-6 grid max-w-[860px] gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Toast
            tone="success"
            title="Ticket confirmed"
            subtitle="Winter Nights · Thu 8 Oct"
            action="View ticket"
          />
          <Toast
            tone="error"
            title="Payment failed"
            subtitle="Your card was declined. Try another method."
            action="Retry"
          />
          <Toast
            tone="neutral"
            title="Saved to favourites"
            subtitle="We'll remind you when sales open."
          />
          <DeadlineBanner
            title="Bid closes soon"
            subtitle="Front row · Winter Nights"
            timer="02:12:40"
          />
        </div>
        <div className="flex flex-col gap-6">
          <EmptyState
            title="No tickets yet"
            body="When you buy or claim a ticket, it will live here — ready to show at the door."
            ctaLabel="Browse events"
          />
          <EmptyState
            variant="filters"
            title="Nothing matches these filters"
            body="Try clearing a filter or widening the date range."
            ctaLabel="Clear filters"
          />
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Modal
            open={modalOpen}
            onOpenChange={setModalOpen}
            title="Withdraw this listing?"
            body="Buyers will no longer see it in search. You can list it again later."
            confirmLabel="Withdraw listing"
            cancelLabel="Keep listing"
            onConfirm={() => setModalOpen(false)}
          />
        </div>
      </div>

      <h2 className="text-heading-h2 mt-14 text-ink-primary">Elevation</h2>
      <div className="mt-6 flex gap-6">
        <div className="shadow-lift size-40 rounded-card bg-surface-default" />
        <div className="shadow-overlay size-40 rounded-panel bg-surface-default" />
      </div>
      </div>

      <SiteFooter />
    </div>
  )
}
