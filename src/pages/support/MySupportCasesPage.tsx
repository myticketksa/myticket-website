import { useMemo, useState } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { StatusBadge, type StatusTone } from '@/components/data-display'
import { EmptyState } from '@/components/feedback'
import { PlusIcon } from '@/components/icons'
import { Button, TextInput } from '@/components/ui'
import { AccountPageHead, PageSection } from '@/layouts'
import { cn } from '@/lib/cn'
import { useGetChatsQuery } from '@/app/api/accountApis'
import { formatApiDate } from '@/lib/api/locale'

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

function mapChatToCase(
  chat: Record<string, unknown>,
  index: number,
  t: TFunction,
): SupportCase {
  const id = String(chat.id ?? chat.chatId ?? `CHAT-${index + 1}`)
  const subject = String(
    chat.subject ?? chat.title ?? chat.last_message ?? t('support.chatSubject', { id }),
  )
  return {
    id,
    kind: 'Case',
    status: chat.status ? String(chat.status) : t('support.statusOpen'),
    statusTone: 'brandTint',
    subject,
    meta: formatApiDate(chat.updated_at) || String(chat.meta ?? t('support.chatMeta')),
    detailMeta: t('support.chatId', { id }),
    messages: [
      {
        from: 'agent',
        body: String(chat.last_message ?? chat.preview ?? t('support.openChatBody')),
        meta: t('support.team'),
      },
    ],
  }
}

/** My support cases — Figma `207:10155`. Chats API when present (no cases CRUD). */
export function MySupportCasesPage() {
  const { t } = useTranslation('account')
  const navigate = useNavigate()
  const { data: chats } = useGetChatsQuery()
  // No chats is the empty state. Two made-up English cases (a fake refund for
  // "Sara") used to stand in for everyone without one.
  const cases = useMemo(() => {
    if (chats && chats.length > 0) {
      return chats.map((chat, index) => mapChatToCase(chat, index, t))
    }
    return []
  }, [chats, t])

  const [activeId, setActiveId] = useState(cases[0]?.id ?? '')
  const active = cases.find((c) => c.id === activeId) ?? cases[0]

  return (
    <>
      <AccountPageHead
        eyebrow={t('eyebrow')}
        title={t('support.casesTitle')}
        subtitle={t('support.casesSubtitle')}
        actions={
          <div className="flex flex-wrap gap-[10px]">
            <Link to="/support/chat">
              <Button variant="secondary" size="md">
                {t('support.chatWithUs')}
              </Button>
            </Link>
            <Link to="/support/new">
              <Button size="md" icon={<PlusIcon size={14} weight="bold" />}>
                {t('support.newCase')}
              </Button>
            </Link>
          </div>
        }
      />

      <PageSection padTop={0} padBottom={96}>
        {cases.length === 0 || !active ? (
          <div className="flex justify-center py-3xl">
            <EmptyState
              variant="firstUse"
              title={t('support.emptyTitle')}
              body={t('support.emptyBody')}
              ctaLabel={t('support.newCase')}
              onCtaClick={() => navigate('/support/new')}
            />
          </div>
        ) : (
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
                        'w-full rounded-[16px] border-[1.5px] px-[18px] py-[16px] text-start',
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
                            {item.kind === 'Complaint'
                              ? t('support.kindComplaint')
                              : t('support.kindCase')}
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

            <div className="flex min-h-[420px] min-w-0 flex-1 flex-col overflow-hidden rounded-[22px] border border-border-default bg-surface-default sm:min-h-[560px]">
              <div className="flex flex-wrap items-center gap-[14px] border-b border-border-divider px-[26px] py-[20px]">
                <div className="min-w-0 flex-1">
                  <p className="text-[18px] font-bold text-ink-primary">{active.subject}</p>
                  <p className="mt-[3px] text-[13px] text-ink-secondary">{active.detailMeta}</p>
                </div>
                <Link to="/support/chat">
                  <Button size="sm">{t('support.openChat')}</Button>
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
                        : 'mr-auto bg-bg-page text-ink-primary',
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
                <TextInput placeholder={t('support.replyPlaceholder')} className="h-[46px]" disabled />
              </div>
            </div>
          </div>
        )}
      </PageSection>
    </>
  )
}
