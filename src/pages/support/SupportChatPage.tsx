import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, PlusIcon } from '@/components/icons'
import { Button, TextInput } from '@/components/ui'
import { FunnelHeader, PageSection } from '@/layouts'
import {
  useGetChatMessagesQuery,
  useGetChatsQuery,
  useMarkChatsReadMutation,
  useSendChatMessageMutation,
} from '@/app/api/accountApis'

const FALLBACK_MESSAGES = [
  {
    from: 'you' as const,
    body: 'Hi — I bought tickets but never got the confirmation email.',
    meta: 'You · 21:32',
  },
  {
    from: 'agent' as const,
    body: 'Happy to help! Can you share the email address you used at checkout? No password — just the address.',
    meta: 'Khalid · 21:33',
  },
  {
    from: 'you' as const,
    body: 'sara@email.com',
    meta: 'You · 21:34',
  },
  {
    from: 'agent' as const,
    body: "Found it — order MT-2026-84193, 2 × Gold for Winter Nights. The email bounced, but your tickets are safe in your account under My tickets. I've re-sent the confirmation now. Anything else?",
    meta: 'Khalid · 21:35',
  },
] as const

const QUICK_LINKS = [
  "Where's my refund?",
  "My QR code won't scan",
  'How do waitlists work?',
  'Gifting a ticket',
] as const

type ChatMessage = {
  from: 'you' | 'agent'
  body: string
  meta: string
}

function mapChatMessage(record: Record<string, unknown>, index: number): ChatMessage {
  const fallback = FALLBACK_MESSAGES[index % FALLBACK_MESSAGES.length]
  const sender = String(record.sender ?? record.from ?? record.role ?? '').toLowerCase()
  const from: ChatMessage['from'] =
    sender.includes('user') || sender.includes('you') || sender.includes('guest')
      ? 'you'
      : 'agent'
  const author = String(record.author ?? record.agent_name ?? (from === 'you' ? 'You' : 'Support'))
  const time = String(record.time ?? record.created_at ?? '')
  return {
    from,
    body: String(record.body ?? record.message ?? record.content ?? fallback.body),
    meta: time ? `${author} · ${time}` : `${author} · ${fallback.meta.split('·').pop()?.trim()}`,
  }
}

function pickSupportChatId(chats: Record<string, unknown>[]): string | number | undefined {
  const support = chats.find((chat) => {
    const channel = String(chat.channel ?? chat.type ?? '').toLowerCase()
    return channel.includes('support') || channel === ''
  })
  const chosen = support ?? chats[0]
  const raw = chosen?.id ?? chosen?.chat_id ?? chosen?.chatId
  if (typeof raw === 'string' || typeof raw === 'number') return raw
  return undefined
}

/** Support chat — Figma `207:12302`. */
export function SupportChatPage() {
  const [draft, setDraft] = useState('')
  const { data: chats } = useGetChatsQuery()
  const chatId = useMemo(
    () => (chats && chats.length > 0 ? pickSupportChatId(chats) : undefined),
    [chats],
  )
  const { data: apiMessages } = useGetChatMessagesQuery(chatId ?? '', { skip: chatId == null })
  const [sendMessage, sendState] = useSendChatMessageMutation()
  const [markRead] = useMarkChatsReadMutation()

  useEffect(() => {
    if (chatId == null) return
    void markRead({ chatIds: [Number(chatId)] })
  }, [chatId, markRead])

  const messages = useMemo(() => {
    if (apiMessages && apiMessages.length > 0) return apiMessages.map(mapChatMessage)
    return [...FALLBACK_MESSAGES]
  }, [apiMessages])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const message = draft.trim()
    if (!message) return

    try {
      await sendMessage({
        chatId: chatId != null ? Number(chatId) : undefined,
        channel: 'support',
        message,
      }).unwrap()
      setDraft('')
    } catch {
      /* Keep UI unchanged on failure — user can retry */
    }
  }

  return (
    <>
      <FunnelHeader label="Live support" backHref="/help" backLabel="Help centre" />

      <PageSection padTop={40} padBottom={96}>
        <div className="flex flex-col items-start gap-[28px] lg:flex-row">
          <div className="flex min-h-[560px] w-full flex-col overflow-hidden rounded-[22px] border border-border-default bg-surface-default lg:max-w-[672px]">
            <div className="flex items-center gap-[14px] border-b border-border-divider px-[24px] py-[18px]">
              <div className="relative flex size-[44px] items-center justify-center rounded-[22px] bg-brand-gradient text-[15px] font-extrabold text-ink-inverse">
                KH
                <span className="absolute right-0 bottom-0 size-[12px] rounded-full border-2 border-surface-default bg-state-success" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15.5px] font-bold text-ink-primary">Khalid · MyTicket Support</p>
                <p className="text-[12.5px] font-semibold text-state-success">
                  Online — replies in about a minute
                </p>
              </div>
              <Button variant="secondary" size="sm">
                End chat
              </Button>
            </div>

            <div className="flex flex-1 flex-col gap-[16px] overflow-y-auto bg-bg-page p-[24px]">
              <div className="flex justify-center">
                <span className="rounded-[12px] border border-border-default bg-surface-default px-[12px] py-[5px] text-[11.5px] font-semibold text-ink-muted">
                  Today · 21:32 — you&apos;re chatting as a guest of MyTicket
                </span>
              </div>
              {messages.map((msg) => (
                <div
                  key={msg.meta + msg.body}
                  className={`flex flex-col ${msg.from === 'you' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={
                      msg.from === 'you'
                        ? 'max-w-[90%] rounded-tl-[16px] rounded-tr-[16px] rounded-br-[4px] rounded-bl-[16px] bg-brand-gradient px-[16px] py-[13px] text-[14px] leading-[1.55] text-ink-inverse'
                        : 'max-w-[448px] rounded-tl-[16px] rounded-tr-[16px] rounded-br-[16px] rounded-bl-[4px] border border-border-default bg-surface-default px-[16px] py-[13px] text-[14px] leading-[1.55] text-ink-primary'
                    }
                  >
                    {msg.body}
                  </div>
                  <p className="mt-[5px] text-[11.5px] text-ink-muted">{msg.meta}</p>
                </div>
              ))}
              <p className="text-[11.5px] text-ink-muted">Khalid is typing…</p>
            </div>

            <form
              className="flex items-center gap-[10px] border-t border-border-divider px-[24px] py-[16px]"
              onSubmit={(event) => void handleSubmit(event)}
            >
              <Button variant="icon" size="md" aria-label="Attach file" type="button">
                <PlusIcon size={16} />
              </Button>
              <TextInput
                className="flex-1 !rounded-[22px]"
                placeholder="Write a message…"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button size="md" type="submit" disabled={sendState.isLoading || !draft.trim()}>
                Send
              </Button>
            </form>
          </div>

          <aside className="flex w-full flex-col gap-[14px] lg:w-[340px]">
            <div className="rounded-[20px] border border-border-default bg-surface-default p-[20px]">
              <p className="text-[15px] font-semibold text-ink-primary">Keep this conversation</p>
              <p className="mt-[10px] text-[13px] leading-[1.55] text-ink-secondary">
                You&apos;re chatting without signing in, so this chat disappears when you close it.
                Sign in to keep the history, or turn it into a tracked case you can follow.
              </p>
              <div className="mt-[14px] flex flex-col gap-[8px]">
                <Link to="/sign-in">
                  <Button size="md" className="w-full">
                    Sign in — you&apos;ll come right back
                  </Button>
                </Link>
                <Link to="/support/new">
                  <Button variant="secondary" size="md" className="w-full">
                    Turn into a tracked case
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[20px] border border-border-default bg-surface-default p-[20px]">
              <p className="text-[15px] font-semibold text-ink-primary">Quicker answers</p>
              <ul className="mt-[12px] flex flex-col gap-[9px]">
                {QUICK_LINKS.map((label) => (
                  <li key={label}>
                    <Link
                      to="/help"
                      className="inline-flex items-center gap-[5px] text-[13.5px] font-semibold text-ink-brand hover:text-ink-brand-mid"
                    >
                      {label}
                      <ArrowRightIcon size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[16px] border border-border-default bg-bg-page px-[18px] py-[16px] text-[13px] leading-[1.55] text-ink-secondary">
              Support hours: 9:00–01:00 AST, every day. Outside these hours, leave a message — we
              reply first thing.
            </div>
          </aside>
        </div>
      </PageSection>
    </>
  )
}
