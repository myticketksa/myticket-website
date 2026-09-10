import { useState, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  BuildingsIcon,
  GavelIcon,
  MinusIcon,
  SearchIcon,
  StarIcon,
  TicketIcon,
  UserCircleIcon,
  WalletIcon,
  type IconProps,
} from '@/components/icons'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'

type Topic = {
  id: string
  title: string
  articles: number
  blurb: string
  Icon: ComponentType<IconProps>
  faqs: { q: string; a: string }[]
}

const TOPICS: Topic[] = [
  {
    id: 'tickets',
    title: 'Tickets & entry',
    articles: 6,
    blurb: 'QR codes, gates, names on tickets and what to do if your phone dies.',
    Icon: TicketIcon,
    faqs: [
      {
        q: 'Where do I find my ticket?',
        a: "Every ticket sits in My tickets the moment payment clears. Open the event, tap the ticket and the QR code fills the screen — it also works with no signal, so you don't need data at the gate.",
      },
      {
        q: 'Can I send a ticket to someone else?',
        a: 'Yes — open the ticket and choose Transfer to a guest. They get their own QR as soon as they accept, and yours stops working.',
      },
      {
        q: 'Do I need to print anything?',
        a: 'No. The offline QR in the app is enough. You can also add tickets to Apple Wallet or download a PDF if you prefer.',
      },
      {
        q: 'The name on my ticket is wrong',
        a: 'Transfer the seat to the right guest, or contact support before doors if the organizer requires ID matching.',
      },
      {
        q: 'What time should I arrive?',
        a: 'Doors and show times are on your ticket. Arrive early for security — busy nights can take around 20 minutes at peak.',
      },
      {
        q: 'Can I bring a bag?',
        a: 'Small bags are usually fine. Professional camera gear and large backpacks are often refused — check the event page for the house rules.',
      },
    ],
  },
  {
    id: 'refunds',
    title: 'Refunds & changes',
    articles: 3,
    blurb: 'Free windows, transfers, and what happens if a show is cancelled.',
    Icon: ArrowCounterClockwiseIcon,
    faqs: [
      {
        q: 'When can I get a free refund?',
        a: 'Most events allow a free refund until a date shown on the ticket. After that, transfer or list on the auction.',
      },
      {
        q: 'How long do refunds take?',
        a: 'Approved refunds typically return to the original payment method within 3–7 business days.',
      },
      {
        q: 'What if the event is cancelled?',
        a: "We'll email you and open an automatic refund. You don't need to file a case unless something looks wrong.",
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & wallet',
    articles: 3,
    blurb: 'Cards, Tabby, cashback, and withdrawing wallet balance.',
    Icon: WalletIcon,
    faqs: [
      {
        q: 'Which payment methods work?',
        a: 'Visa, Mastercard, mada, Apple Pay, and Tabby on eligible events. Your wallet balance can also pay part or all of an order.',
      },
      {
        q: 'How does cashback work?',
        a: 'Eligible purchases credit your MyTicket wallet after the event. You can spend it on future tickets or withdraw when the balance allows.',
      },
      {
        q: 'Can I split a payment?',
        a: 'Tabby splits eligible orders into instalments. The schedule is shown at checkout and again on the ticket order card.',
      },
    ],
  },
  {
    id: 'auction',
    title: 'Resale auction',
    articles: 3,
    blurb: 'Listing a seat, bidding, fees, and settlement.',
    Icon: GavelIcon,
    faqs: [
      {
        q: 'How do I list a ticket?',
        a: 'Open the ticket and choose List for resale. Set your ask within the allowed range and we handle payout when it sells.',
      },
      {
        q: 'Are auction tickets genuine?',
        a: 'Yes — every listing is an original MyTicket seat. The QR transfers to the buyer automatically on settle.',
      },
      {
        q: 'What fees apply?',
        a: 'Seller and buyer fees are shown before you confirm. They come out of the settlement so there are no surprises later.',
      },
    ],
  },
  {
    id: 'waitlists',
    title: 'Waitlists',
    articles: 2,
    blurb: 'Joining a sold-out night and how alerts work.',
    Icon: StarIcon,
    faqs: [
      {
        q: 'How do waitlists work?',
        a: "Join from the event page. If seats free up or a resale lands in range, we'll notify you first.",
      },
      {
        q: 'Do waitlists cost anything?',
        a: "Joining is free. You're only charged if you buy a ticket when one becomes available.",
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & security',
    articles: 2,
    blurb: 'Sign-in, notifications, and keeping your tickets safe.',
    Icon: UserCircleIcon,
    faqs: [
      {
        q: 'How do I turn on two-factor sign-in?',
        a: 'Open Settings → Security and add a phone number or authenticator. We recommend it before any high-value purchase.',
      },
      {
        q: 'I lost access to my email',
        a: 'Contact support with your phone number and a recent order reference so we can verify and restore the account.',
      },
    ],
  },
  {
    id: 'business',
    title: 'Business requests',
    articles: 2,
    blurb: 'Vendor and talent requests, and how organizer partnership works.',
    Icon: BuildingsIcon,
    faqs: [
      {
        q: 'How do I become a vendor or talent?',
        a: 'Sign in as a guest, open Become a business, and submit a request. Our team reviews it in 2–5 working days. Acceptance does not change your login — we contact you outside the platform if needed.',
      },
      {
        q: 'How do I become an organizer?',
        a: 'Organizer accounts are created after an office contract. Contact partnerships from the help or support flow — there is no self-serve apply form.',
      },
    ],
  },
]

const QUICK_LINKS = [
  { label: 'Find my ticket', href: '/my-tickets' },
  { label: 'Check a refund', href: '/my-tickets' },
  { label: 'Track a business request', href: '/become-business' },
  { label: 'Change my notifications', href: '/settings' },
  { label: 'How the auction works', href: '/auctions' },
  { label: 'Follow my support cases', href: '/support' },
] as const

/** Help centre — Figma `207:12147`. */
export function HelpPage() {
  const [topicId, setTopicId] = useState(TOPICS[0].id)
  const [openFaq, setOpenFaq] = useState(0)
  const [query, setQuery] = useState('')
  const topic = TOPICS.find((item) => item.id === topicId) ?? TOPICS[0]

  return (
    <>
      <section className="relative w-full overflow-hidden bg-bg-page px-page-gutter pt-[64px] pb-[56px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 90% 46% at 12% 0%, rgba(242,95,44,0.2), transparent 62%)',
          }}
        />
        <div className="relative mx-auto flex w-full max-w-[820px] flex-col items-center text-center">
          <h1 className="text-[52px] leading-[1.04] font-extrabold tracking-[-1.82px] text-ink-primary">
            How can we help?
          </h1>
          <p className="mt-[12px] text-[17px] font-medium text-ink-secondary">
            Answers to the things people ask us most — refunds, transfers, entry and the auction.
          </p>
          <form
            className="mt-[28px] flex w-full items-center gap-[10px] rounded-[20px] border border-border-default bg-surface-default p-[8px] shadow-help-search"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="flex min-w-0 flex-1 items-center gap-[12px] px-lg">
              <SearchIcon size={19} className="shrink-0 text-ink-muted" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search help topics — refunds, QR codes, transfers…"
                className="h-[56px] min-w-0 flex-1 bg-transparent text-[16px] font-medium text-ink-primary outline-none placeholder:text-ink-muted"
              />
            </label>
            <Button type="submit" size="lg" className="h-[56px] shrink-0 rounded-[14px] px-[28px]">
              Search
            </Button>
          </form>
        </div>
      </section>

      <PageSection padTop={0} padBottom={0}>
        <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
          {TOPICS.map((item) => {
            const active = item.id === topic.id
            const Icon = item.Icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTopicId(item.id)
                  setOpenFaq(0)
                }}
                className={cn(
                  'flex flex-col items-start rounded-[20px] border-[1.5px] p-[22px] text-left transition-colors',
                  active
                    ? 'border-ink-brand bg-bg-tint-brand'
                    : 'border-border-default bg-surface-default hover:border-border-brand',
                )}
              >
                <span
                  className={cn(
                    'flex size-[42px] items-center justify-center rounded-[14px]',
                    active
                      ? 'bg-brand-gradient text-ink-inverse'
                      : 'bg-bg-tint-brand text-ink-brand',
                  )}
                >
                  <Icon size={17} />
                </span>
                <span className="mt-[14px] text-[17px] font-bold tracking-[-0.34px] text-ink-primary">
                  {item.title}
                </span>
                <span className="mt-[4px] text-[13px] font-medium text-ink-secondary">
                  {item.articles} articles
                </span>
              </button>
            )
          })}
        </div>
      </PageSection>

      <PageSection padTop={60} padBottom={96}>
        <div className="flex flex-col gap-[44px] lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <h2 className="text-[34px] font-extrabold tracking-[-1.19px] text-ink-primary">
              {topic.title}
            </h2>
            <p className="mt-[6px] text-[15px] font-medium text-ink-secondary">{topic.blurb}</p>
            <div className="mt-[22px] flex flex-col gap-[10px]">
              {topic.faqs.map((faq, index) => {
                const open = openFaq === index
                return (
                  <div
                    key={faq.q}
                    className={cn(
                      'overflow-hidden rounded-[18px] border bg-surface-default',
                      open ? 'border-border-brand-soft' : 'border-border-default',
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-lg px-[22px] py-[20px] text-left"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? -1 : index)}
                    >
                      <span className="text-[16px] font-bold tracking-[-0.24px] text-ink-primary">
                        {faq.q}
                      </span>
                      <span
                        className={cn(
                          'flex size-[28px] shrink-0 items-center justify-center rounded-[14px]',
                          open
                            ? 'bg-brand-gradient text-ink-inverse'
                            : 'bg-bg-tint-brand text-[15px] font-bold text-brand-gradient-end',
                        )}
                      >
                        {open ? <MinusIcon size={15} /> : <span aria-hidden>+</span>}
                      </span>
                    </button>
                    {open && (
                      <div className="px-[22px] pb-[22px]">
                        <p className="max-w-[700px] text-[15px] leading-[1.65] font-medium text-ink-secondary">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-lg lg:w-[380px]">
            <div className="rounded-[22px] border border-border-default bg-surface-inverse p-[26px]">
              <p className="text-[12px] font-bold tracking-[0.96px] text-ink-warm-on-dark uppercase">
                Still stuck?
              </p>
              <p className="mt-[10px] text-[22px] font-extrabold tracking-[-0.55px] text-bg-page">
                Talk to a human
              </p>
              <p className="mt-[8px] text-[14px] leading-[1.6] font-medium text-bg-page">
                Support is open 09:00 — 01:00 every day, in Arabic and English. Average reply time
                today is 6 minutes.
              </p>
              <Link to="/support/new" className="mt-[20px] block">
                <Button size="md" className="h-[48px] w-full rounded-[24px]">
                  Start a chat
                </Button>
              </Link>
              <Link to="/support/new" className="mt-[10px] block">
                <Button
                  variant="secondary"
                  size="md"
                  className="h-[48px] w-full rounded-[24px] border-[1.5px] border-bg-page/28 bg-transparent text-bg-page hover:border-bg-page hover:bg-transparent hover:text-bg-page"
                >
                  Email support
                </Button>
              </Link>
            </div>

            <div className="rounded-[20px] border border-border-default bg-surface-default p-[22px]">
              <p className="text-[12px] font-extrabold tracking-[1.2px] text-brand-gradient-end uppercase">
                Quick links
              </p>
              <ul className="mt-[14px] flex flex-col gap-[11px]">
                {QUICK_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="inline-flex items-center gap-[5px] text-[15px] font-semibold text-ink-primary hover:text-ink-brand"
                    >
                      {link.label}
                      <ArrowRightIcon size={15} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[20px] border border-border-default bg-help-report p-[22px]">
              <p className="text-[17px] font-extrabold tracking-[-0.34px] text-ink-primary">
                Report a problem with an event
              </p>
              <p className="mt-[6px] text-[14px] leading-[1.55] font-medium text-ink-secondary">
                Cancelled, moved, or not as described? Tell us and we&apos;ll take it up with the
                organizer.
              </p>
              <Link to="/support/new" className="mt-lg block">
                <Button variant="secondary" size="md" className="h-[44px] w-full rounded-[22px]">
                  Report an issue
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </PageSection>
    </>
  )
}
