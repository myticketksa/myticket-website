import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'

const DOCS = [
  {
    id: 'terms',
    label: 'Terms of service',
    toc: [
      '1 · Your account',
      '2 · Tickets & purchases',
      '3 · Refunds & cancellations',
      '4 · Resale & gifting',
      '5 · The marketplace boundary',
      '6 · Wallet & money',
    ],
    sections: [
      {
        title: '1 · Your account',
        body: "One person, one account. You're responsible for keeping your sign-in details private, and for what happens under your account. You must be 18 or older to buy tickets; younger guests attend under a guardian's booking. We may suspend accounts that break these terms, and we'll always tell you why and how to appeal.",
      },
      {
        title: '2 · Tickets & purchases',
        body: "A ticket is a licence to attend, issued by the event's organizer and delivered by MyTicket as a unique QR code. The price you see at checkout is the price you pay: ticket price plus the MyTicket platform fee, always shown separately. Purchase limits per event exist to keep tickets with real fans and are enforced at checkout.",
      },
      {
        title: '3 · Refunds & cancellations',
        body: "Each organizer sets the refund policy for their own event — it's shown on the event page, at checkout, and on your ticket. Within that policy, MyTicket executes the refund and returns the money to your wallet. If an event is cancelled, the ticket price is refunded automatically regardless of policy. Platform fees are refundable only when an event is cancelled.",
      },
      {
        title: '4 · Resale & gifting',
        body: 'Tickets may be resold only through the MyTicket auction, where the transfer is verified and the seller pays a 10% commission. Tickets bought outside MyTicket carry no guarantee and may be refused at the gate. Gifting transfers ownership permanently once the recipient claims; gifted and auction-won tickets cannot be re-gifted or resold.',
      },
      {
        title: '5 · The marketplace boundary',
        body: 'MyTicket introduces organizers to talents and vendors and hosts their conversations. We do not broker, guarantee, or arbitrate the work itself — contracts, pricing, invoicing and payment happen directly between the parties. Reviews reflect the experience of real counterparties and must stay factual.',
      },
      {
        title: '6 · Wallet & money',
        body: "Your wallet holds money you've added, refunds, cashback and gift credit. Money you added and refunds can be withdrawn to a Saudi bank account in your name; cashback and gift credit are spend-only. When you pay from the wallet, spend-only credit is used first. Balances never expire while your account is active.",
      },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy policy',
    toc: [
      '1 · What we collect',
      '2 · How we use it',
      '3 · Who we share with',
      '4 · Your choices',
      '5 · Retention',
      '6 · Contact',
    ],
    sections: [
      {
        title: '1 · What we collect',
        body: 'We collect account details, booking history, device and usage data needed to run MyTicket — sign-in, payments, QR delivery, support and fraud prevention.',
      },
      {
        title: '2 · How we use it',
        body: 'Data powers the product you asked for: tickets, waitlists, wallet, marketplace introductions and customer support. We do not sell personal data.',
      },
      {
        title: '3 · Who we share with',
        body: 'Payment processors, SMS/email providers and organizers (limited to what they need for your booking) receive only what is required. Legal requests are handled under Saudi law.',
      },
      {
        title: '4 · Your choices',
        body: 'You can update profile details, download your data, or delete your account from Settings. Marketing emails are optional and can be turned off any time.',
      },
      {
        title: '5 · Retention',
        body: 'We keep booking and payment records as long as the law requires. Optional marketing data is removed when you opt out or delete your account.',
      },
      {
        title: '6 · Contact',
        body: 'Privacy questions go to privacy@myticket.sa — a person answers, not a form letter.',
      },
    ],
  },
  {
    id: 'cookies',
    label: 'Cookie policy',
    toc: [
      '1 · Essential cookies',
      '2 · Analytics',
      '3 · Preferences',
      '4 · Third parties',
      '5 · Managing cookies',
      '6 · Updates',
    ],
    sections: [
      {
        title: '1 · Essential cookies',
        body: 'These keep you signed in, protect checkout and remember language. The site cannot run without them.',
      },
      {
        title: '2 · Analytics',
        body: 'Optional analytics help us understand discovery and checkout drop-off. They are never sold and can be declined in Settings → Privacy.',
      },
      {
        title: '3 · Preferences',
        body: 'We store UI choices such as language and recently viewed filters so the next visit starts where you left off.',
      },
      {
        title: '4 · Third parties',
        body: 'Payment and map providers may set their own cookies when you use those features. Their policies apply to those cookies.',
      },
      {
        title: '5 · Managing cookies',
        body: 'Change preferences any time in Settings → Privacy, or clear cookies in your browser. Essential cookies will return on the next visit.',
      },
      {
        title: '6 · Updates',
        body: 'When this policy changes in a material way, we note the date at the top of this page.',
      },
    ],
  },
] as const

/** Legal — Figma `207:12042`. */
export function LegalPage() {
  const [active, setActive] = useState(0)
  const doc = DOCS[active]

  return (
    <>
      <PageSection padTop={44} padBottom={0}>
        <h1 className="max-w-[900px] text-[44px] leading-[1.02] font-extrabold tracking-[-1.75px] text-ink-primary sm:text-[50px]">
          The fine print, readable.
        </h1>
        <p className="mt-[8px] max-w-[640px] text-[16px] text-ink-secondary">
          The rules of using MyTicket. Written to be read, not skimmed past.
        </p>
        <div className="mt-[24px]">
          <div className="flex flex-wrap items-end justify-between gap-md">
            <div className="flex gap-[22px]">
              {DOCS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className={cn(
                    'flex flex-col px-[2px] text-[15px] font-semibold',
                    index === active ? 'text-ink-brand-mid' : 'text-ink-secondary',
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      'mt-[11px] h-[2px] w-full',
                      index === active ? 'bg-ink-brand' : 'bg-transparent',
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="pb-[2px] text-[12.5px] font-semibold text-ink-muted">
              Last updated 12 Jul 2026
            </p>
          </div>
          <div className="h-px bg-border-default" />
        </div>
      </PageSection>

      <PageSection padTop={28} padBottom={96}>
        <div className="flex flex-col gap-[32px] lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 rounded-[16px] border border-border-default bg-surface-default px-[20px] py-[18px] lg:w-[260px]">
            <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
              In this document
            </p>
            <nav className="mt-[12px] flex flex-col gap-[9px]">
              {doc.toc.map((item) => (
                <a
                  key={item}
                  href={`#${item.replace(/\s+/g, '-').toLowerCase()}`}
                  className="text-[13.5px] font-semibold text-ink-secondary hover:text-ink-brand"
                >
                  {item}
                </a>
              ))}
            </nav>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-[14px]">
            {doc.sections.map((section) => (
              <article
                key={section.title}
                id={section.title.replace(/\s+/g, '-').toLowerCase()}
                className="rounded-[18px] border border-border-default bg-surface-default px-[28px] py-[26px]"
              >
                <h2 className="text-[18px] font-bold text-ink-primary">{section.title}</h2>
                <p className="mt-[10px] text-[14.5px] leading-[1.7] text-ink-secondary">
                  {section.body}
                </p>
              </article>
            ))}
            <div className="rounded-[16px] border border-border-default bg-bg-page px-[20px] py-[16px] text-[13.5px] text-ink-secondary">
              Questions about any of this?{' '}
              <Link to="/support/new" className="font-semibold text-ink-brand">
                Talk to support
              </Link>{' '}
              — a person, not a policy.
            </div>
          </div>
        </div>
      </PageSection>
    </>
  )
}
