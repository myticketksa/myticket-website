import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge, type StatusTone } from '@/components/data-display'
import { PlusIcon } from '@/components/icons'
import { Button, TextInput } from '@/components/ui'
import { AccountPageHead, PageSection } from '@/layouts'
import { cn } from '@/lib/cn'

type CaseKind = 'Case' | 'Complaint'

interface SupportCase {
  id: string
  kind: CaseKind
  status: string
  statusTone: StatusTone
  subject: string
  meta: string
  detailMeta: string
  orderId?: string
  messages: { from: 'you' | 'agent'; body: string; meta: string }[]
}

const CASES: SupportCase[] = [
  {
    id: 'CS-88231',
    kind: 'Case',
    status: 'Waiting on you',
    statusTone: 'brandTint',
    subject: 'Refund not showing in wallet',
    meta: 'Payments · updated 2h ago',
    detailMeta: 'Case CS-88231 · Payments · opened 1 Aug · linked to order',
    orderId: 'MT-2026-71204',
    messages: [
      {
        from: 'you',
        body: 'My refund for Layali Oud Sessions was approved on 28 Jul but the SAR 140 still isn’t in my wallet.',
        meta: 'You · 1 Aug, 14:02',
      },
      {
        from: 'agent',
        body: "Thanks Sara — I can see the approval. The payout batch failed a check on our side, so I've re-issued it manually. It should appear within 24 hours. Could you confirm once you see it?",
        meta: 'Noura · MyTicket Support · 1 Aug, 15:47',
      },
      {
        from: 'agent',
        body: 'Just checking in — is the SAR 140 showing in your wallet now?',
        meta: 'Noura · MyTicket Support · Today, 11:02',
      },
    ],
  },
  {
    id: 'CS-87904',
    kind: 'Case',
    status: 'In progress',
    statusTone: 'infoTint',
    subject: "QR code won't load offline",
    meta: 'App & tickets · updated yesterday',
    detailMeta: 'Case CS-87904 · App & tickets · opened 28 Jul',
    messages: [
      {
        from: 'you',
        body: "My QR for Winter Nights won't open when I'm offline — it just spins.",
        meta: 'You · 28 Jul, 19:10',
      },
      {
        from: 'agent',
        body: "We've reproduced this on Android 14. A fix is shipping in the next app build — I'll ping you when it's live.",
        meta: 'Lina · MyTicket Support · 29 Jul, 10:22',
      },
    ],
  },
  {
    id: 'CM-1042',
    kind: 'Complaint',
    status: 'Being assessed',
    statusTone: 'brandTint',
    subject: 'Overcrowding at Gate 2, Desert Glow',
    meta: 'Venue safety · can no longer be withdrawn',
    detailMeta: 'Complaint CM-1042 · Venue safety · opened 20 Jul',
    messages: [
      {
        from: 'you',
        body: 'Gate 2 was dangerously crowded for Desert Glow — no stewards for twenty minutes.',
        meta: 'You · 20 Jul, 23:40',
      },
    ],
  },
  {
    id: 'CS-80412',
    kind: 'Case',
    status: 'Closed',
    statusTone: 'inactive',
    subject: 'Name spelt wrong on ticket',
    meta: 'Resolved 12 Jun · can be reopened',
    detailMeta: 'Case CS-80412 · Tickets · resolved 12 Jun',
    messages: [
      {
        from: 'you',
        body: 'My ticket shows “Sara Al Harby” instead of Al-Harbi.',
        meta: 'You · 10 Jun, 09:15',
      },
      {
        from: 'agent',
        body: 'Fixed — re-issued QR with the correct spelling. Sorry for the slip.',
        meta: 'Khalid · MyTicket Support · 12 Jun, 11:03',
      },
    ],
  },
]

/** My support cases — Figma `207:10155`. */
export function MySupportCasesPage() {
  const [activeId, setActiveId] = useState(CASES[0].id)
  const active = CASES.find((c) => c.id === activeId) ?? CASES[0]

  return (
    <>
      <AccountPageHead
        eyebrow="Your account"
        title="Support cases"
        subtitle="Everything you've raised with us — problems we're fixing and complaints we're looking into."
        actions={
          <div className="flex flex-wrap gap-[10px]">
            <Link to="/support/chat">
              <Button variant="secondary" size="md">
                Chat with us
              </Button>
            </Link>
            <Link to="/support/new">
              <Button size="md" icon={<PlusIcon size={14} weight="bold" />}>
                Raise something new
              </Button>
            </Link>
          </div>
        }
      />

      <PageSection padTop={0} padBottom={96}>
        <div className="flex flex-col gap-[24px] lg:flex-row lg:items-start">
          <ul className="flex w-full flex-col gap-[10px] lg:w-[420px]">
            {CASES.map((item) => {
              const selected = item.id === active.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={cn(
                      'w-full rounded-[16px] border-[1.5px] px-[18px] py-[16px] text-left',
                      selected
                        ? 'border-ink-brand bg-surface-default'
                        : 'border-border-default bg-surface-default',
                    )}
                  >
                    <div className="flex items-center justify-between gap-sm">
                      <div className="flex flex-wrap gap-[8px]">
                        <StatusBadge
                          tone={item.kind === 'Complaint' ? 'dangerTint' : 'neutralOutline'}
                        >
                          {item.kind}
                        </StatusBadge>
                        <StatusBadge tone={item.statusTone}>{item.status}</StatusBadge>
                      </div>
                      <span className="text-[11.5px] text-ink-muted">{item.id}</span>
                    </div>
                    <p className="mt-[4px] text-[14.5px] font-bold text-ink-primary">
                      {item.subject}
                    </p>
                    <p className="mt-[3px] text-[12.5px] text-ink-secondary">{item.meta}</p>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="flex min-h-[560px] min-w-0 flex-1 flex-col overflow-hidden rounded-[22px] border border-border-default bg-surface-default">
            <div className="flex flex-wrap items-center gap-[14px] border-b border-border-divider px-[26px] py-[20px]">
              <div className="min-w-0 flex-1">
                <p className="text-[18px] font-bold text-ink-primary">{active.subject}</p>
                <p className="mt-[2px] text-[13px] text-ink-muted">
                  {active.detailMeta}
                  {active.orderId && (
                    <>
                      {' '}
                      <Link to="/my-tickets" className="font-semibold text-ink-brand">
                        {active.orderId}
                      </Link>
                    </>
                  )}
                </p>
              </div>
              <StatusBadge tone={active.statusTone}>{active.status}</StatusBadge>
              <Button variant="secondary" size="sm">
                Close case
              </Button>
            </div>

            <div className="flex flex-1 flex-col gap-[16px] overflow-y-auto bg-bg-page px-[26px] py-[24px]">
              {active.messages.map((msg) => (
                <div
                  key={msg.meta + msg.body}
                  className={`flex flex-col ${msg.from === 'you' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={
                      msg.from === 'you'
                        ? 'max-w-[90%] rounded-tl-[16px] rounded-tr-[16px] rounded-br-[4px] rounded-bl-[16px] bg-brand-gradient px-[16px] py-[13px] text-[14px] leading-[1.55] text-ink-inverse'
                        : 'max-w-[90%] rounded-tl-[16px] rounded-tr-[16px] rounded-br-[16px] rounded-bl-[4px] border border-border-default bg-surface-default px-[16px] py-[13px] text-[14px] leading-[1.55] text-ink-primary'
                    }
                  >
                    {msg.body}
                  </div>
                  <p className="mt-[5px] text-[11.5px] text-ink-muted">{msg.meta}</p>
                </div>
              ))}
            </div>

            <form
              className="flex gap-sm border-t border-border-divider p-lg"
              onSubmit={(e) => e.preventDefault()}
            >
              <TextInput className="flex-1" placeholder="Write a reply…" />
              <Button size="md" type="submit">
                Send
              </Button>
            </form>
          </div>
        </div>
      </PageSection>
    </>
  )
}
