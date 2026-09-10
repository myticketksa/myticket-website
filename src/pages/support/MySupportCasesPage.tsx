import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge, type StatusTone } from '@/components/data-display'
import { PlusIcon } from '@/components/icons'
import { Button, TextInput } from '@/components/ui'
import { AccountPageHead, PageSection } from '@/layouts'
import { cn } from '@/lib/cn'
import { useGetChatsQuery } from '@/app/api/accountApis'

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
    ],
  },
]

function mapChatToCase(chat: Record<string, unknown>, index: number): SupportCase {
  const id = String(chat.id ?? chat.chatId ?? `CHAT-${index + 1}`)
  const subject = String(
    chat.subject ?? chat.title ?? chat.last_message ?? `Support chat ${id}`,
  )
  return {
    id,
    kind: 'Case',
    status: String(chat.status ?? 'Open'),
    statusTone: 'brandTint',
    subject,
    meta: String(chat.updated_at ?? chat.meta ?? 'Support · chat'),
    detailMeta: `Chat ${id}`,
    messages: [
      {
        from: 'agent',
        body: String(
          chat.last_message ?? chat.preview ?? 'Open chat to continue this conversation.',
        ),
        meta: 'MyTicket Support',
      },
    ],
  }
}

/** My support cases — Figma `207:10155`. Chats API when present (no cases CRUD). */
export function MySupportCasesPage() {
  const { data: chats } = useGetChatsQuery()
  const cases = useMemo(() => {
    if (chats && chats.length > 0) return chats.map(mapChatToCase)
    return CASES
  }, [chats])

  const [activeId, setActiveId] = useState(cases[0]?.id ?? CASES[0]!.id)
  const active = cases.find((c) => c.id === activeId) ?? cases[0]!

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
            {cases.map((item) => {
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
                <p className="mt-[3px] text-[13px] text-ink-secondary">{active.detailMeta}</p>
              </div>
              <Link to="/support/chat">
                <Button size="sm">Open chat</Button>
              </Link>
            </div>
            <div className="flex flex-1 flex-col gap-[14px] overflow-y-auto px-[26px] py-[22px]">
              {active.messages.map((message, index) => (
                <div
                  key={`${active.id}-${index}`}
                  className={cn(
                    'max-w-[85%] rounded-[16px] px-[16px] py-[12px]',
                    message.from === 'you'
                      ? 'ml-auto bg-brand-gradient text-ink-inverse'
                      : 'bg-bg-page text-ink-primary',
                  )}
                >
                  <p className="text-[14px] leading-[1.5]">{message.body}</p>
                  <p
                    className={cn(
                      'mt-[6px] text-[11.5px]',
                      message.from === 'you' ? 'text-ink-inverse/80' : 'text-ink-muted',
                    )}
                  >
                    {message.meta}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-border-divider px-[18px] py-[14px]">
              <TextInput placeholder="Reply in chat…" className="h-[46px]" disabled />
            </div>
          </div>
        </div>
      </PageSection>
    </>
  )
}
