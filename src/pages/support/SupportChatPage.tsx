import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
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

const FALLBACK_FROM = ['you', 'agent', 'you', 'agent'] as const

const QUICK_LINK_IDS = ['refund', 'qr', 'waitlists', 'gift'] as const

type ChatMessage = {
  from: 'you' | 'agent'
  body: string
  meta: string
}

function mapChatMessage(
  record: Record<string, unknown>,
  labels: { you: string; agent: string },
  fallback: ChatMessage,
): ChatMessage {
  const sender = String(record.sender ?? record.from ?? record.role ?? '').toLowerCase()
  const from: ChatMessage['from'] =
    sender.includes('user') || sender.includes('you') || sender.includes('guest')
      ? 'you'
      : 'agent'
  const author = String(
    record.author ?? record.agent_name ?? (from === 'you' ? labels.you : labels.agent),
  )
  const time = String(record.time ?? record.created_at ?? '')
  return {
    from,
    body: String(record.body ?? record.message ?? record.content ?? fallback.body),
    meta: time
      ? `${author} · ${time}`
      : `${author} · ${fallback.meta.split('·').pop()?.trim() ?? ''}`,
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
  const { t } = useTranslation('account')
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

  const labels = useMemo(
    () => ({ you: t('support.you'), agent: t('support.agent') }),
    [t],
  )

  const fallbackMessages = useMemo(() => {
    const rows = t('support.fallback', { returnObjects: true }) as
      | { body: string; time: string }[]
      | string
    if (!Array.isArray(rows)) return [] as ChatMessage[]
    return rows.map((row, index) => {
      const from = FALLBACK_FROM[index] ?? 'agent'
      const author = from === 'you' ? labels.you : 'Khalid'
      return {
        from,
        body: row.body,
        meta: `${author} · ${row.time}`,
      } satisfies ChatMessage
    })
  }, [labels.you, t])

  const messages = useMemo(() => {
    if (apiMessages && apiMessages.length > 0) {
      return apiMessages.map((record, index) =>
        mapChatMessage(
          record,
          labels,
          fallbackMessages[index % Math.max(fallbackMessages.length, 1)] ?? {
            from: 'agent',
            body: '',
            meta: labels.agent,
          },
        ),
      )
    }
    return fallbackMessages
  }, [apiMessages, fallbackMessages, labels])

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
      <FunnelHeader
        label={t('support.chatHeader')}
        backHref="/help"
        backLabel={t('support.backHelp')}
      />

      <PageSection padTop={40} padBottom={96}>
        <div className="flex flex-col items-start gap-[28px] lg:flex-row">
          <div className="flex min-h-[420px] w-full flex-col overflow-hidden rounded-[22px] border border-border-default bg-surface-default sm:min-h-[560px] lg:max-w-[672px]">
            <div className="flex items-center gap-[14px] border-b border-border-divider px-[24px] py-[18px]">
              <div className="relative flex size-[44px] items-center justify-center rounded-[22px] bg-brand-gradient text-[15px] font-extrabold text-ink-inverse">
                KH
                <span className="absolute end-0 bottom-0 size-[12px] rounded-full border-2 border-surface-default bg-state-success" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15.5px] font-bold text-ink-primary">{t('support.agentName')}</p>
                <p className="text-[12.5px] font-semibold text-state-success">
                  {t('support.agentOnline')}
                </p>
              </div>
              <Button variant="secondary" size="sm">
                {t('support.endChat')}
              </Button>
            </div>

            <div className="flex flex-1 flex-col gap-[16px] overflow-y-auto bg-bg-page p-[24px]">
              <div className="flex justify-center">
                <span className="rounded-[12px] border border-border-default bg-surface-default px-[12px] py-[5px] text-[11.5px] font-semibold text-ink-muted">
                  {t('support.guestBanner', { time: '21:32' })}
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
                        ? 'max-w-[90%] rounded-ss-[16px] rounded-se-[16px] rounded-ee-[4px] rounded-es-[16px] bg-brand-gradient px-[16px] py-[13px] text-[14px] leading-[1.55] text-ink-inverse'
                        : 'max-w-[448px] rounded-ss-[16px] rounded-se-[16px] rounded-ee-[16px] rounded-es-[4px] border border-border-default bg-surface-default px-[16px] py-[13px] text-[14px] leading-[1.55] text-ink-primary'
                    }
                  >
                    {msg.body}
                  </div>
                  <p className="mt-[5px] text-[11.5px] text-ink-muted">{msg.meta}</p>
                </div>
              ))}
              <p className="text-[11.5px] text-ink-muted">
                {t('support.typing', { name: 'Khalid' })}
              </p>
            </div>

            <form
              className="flex items-center gap-[10px] border-t border-border-divider px-[24px] py-[16px]"
              onSubmit={(event) => void handleSubmit(event)}
            >
              <Button variant="icon" size="md" aria-label={t('support.attachAria')} type="button">
                <PlusIcon size={16} />
              </Button>
              <TextInput
                className="flex-1 !rounded-[22px]"
                placeholder={t('support.chatPlaceholder')}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button size="md" type="submit" disabled={sendState.isLoading || !draft.trim()}>
                {t('support.send')}
              </Button>
            </form>
          </div>

          <aside className="flex w-full flex-col gap-[14px] lg:w-[340px]">
            <div className="rounded-[20px] border border-border-default bg-surface-default p-[20px]">
              <p className="text-[15px] font-semibold text-ink-primary">{t('support.keepTitle')}</p>
              <p className="mt-[10px] text-[13px] leading-[1.55] text-ink-secondary">
                {t('support.keepBody')}
              </p>
              <div className="mt-[14px] flex flex-col gap-[8px]">
                <Link to="/sign-in">
                  <Button size="md" className="w-full">
                    {t('support.keepSignIn')}
                  </Button>
                </Link>
                <Link to="/support/new">
                  <Button variant="secondary" size="md" className="w-full">
                    {t('support.keepCase')}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[20px] border border-border-default bg-surface-default p-[20px]">
              <p className="text-[15px] font-semibold text-ink-primary">{t('support.quickerTitle')}</p>
              <ul className="mt-[12px] flex flex-col gap-[9px]">
                {QUICK_LINK_IDS.map((id) => (
                  <li key={id}>
                    <Link
                      to="/help"
                      className="inline-flex items-center gap-[5px] text-[13.5px] font-semibold text-ink-brand hover:text-ink-brand-mid"
                    >
                      {t(`support.quick.${id}`)}
                      <ArrowRightIcon size={14} className="rtl:rotate-180" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[16px] border border-border-default bg-bg-page px-[18px] py-[16px] text-[13px] leading-[1.55] text-ink-secondary">
              {t('support.hours')}
            </div>
          </aside>
        </div>
      </PageSection>
    </>
  )
}
