import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { PlusIcon } from '@/components/icons'
import { Button, Field, Select, Textarea, TextInput } from '@/components/ui'
import { FunnelHeader, PageSection } from '@/layouts'
import { cn } from '@/lib/cn'
import { useSendChatMessageMutation } from '@/app/api/accountApis'
import { useAppDispatch } from '@/app/hooks'
import { toastPushed } from '@/features/ui/uiSlice'
import { apiErrorMessage } from '@/lib/api/unwrap'

const KIND_IDS = ['working', 'right'] as const
const URGENCY_IDS = ['low', 'normal', 'urgent'] as const

/** New support case — Figma `207:11781`. Opens support chat (no cases CRUD API). */
export function NewSupportCasePage() {
  const { t } = useTranslation('account')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [sendMessage, sendState] = useSendChatMessageMutation()
  const [kind, setKind] = useState<(typeof KIND_IDS)[number]>('working')
  const [urgency, setUrgency] = useState<(typeof URGENCY_IDS)[number]>('normal')
  const [subject, setSubject] = useState('')
  const [details, setDetails] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const tag = kind === 'working' ? t('support.tagIssue') : t('support.tagComplaint')
    const urgencyLabel = t(`support.urgency.${urgency}`)
    const message = [
      `[${tag} · ${urgencyLabel}]`,
      subject.trim() || t('support.defaultSubject'),
      details.trim(),
    ]
      .filter(Boolean)
      .join('\n\n')

    try {
      await sendMessage({ channel: 'support', message }).unwrap()
      dispatch(toastPushed('success', t('support.success')))
      navigate('/support/chat')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('support.error'))))
      navigate('/support/chat')
    }
  }

  return (
    <>
      <FunnelHeader
        label={t('support.header')}
        backHref="/support"
        backLabel={t('support.backToCases')}
      />

      <PageSection padTop={44} padBottom={96}>
        <div className="mx-auto w-full max-w-[720px]">
          <h1 className="text-[28px] leading-[1.04] font-extrabold tracking-[-1.47px] text-ink-primary sm:text-[36px] lg:text-[42px]">
            {t('support.newTitle')}
          </h1>
          <p className="mt-[10px] max-w-[620px] text-[16px] text-ink-secondary">
            {t('support.ledeBefore')}{' '}
            <Link to="/support" className="font-semibold text-ink-brand">
              {t('support.ledeLink')}
            </Link>
            .
          </p>

          <div className="mt-[26px] grid gap-[12px] sm:grid-cols-2">
            {KIND_IDS.map((id) => {
              const active = kind === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setKind(id)}
                  className={cn(
                    'rounded-[18px] border-[1.5px] px-[22px] py-[20px] text-start',
                    active
                      ? 'border-ink-brand bg-bg-tint-brand'
                      : 'border-border-default bg-surface-default',
                  )}
                >
                  <p className="text-[16px] font-bold text-ink-primary">
                    {t(`support.kinds.${id}.title`)}
                  </p>
                  <p className="mt-[4px] text-[13px] leading-[1.5] text-ink-secondary">
                    {t(`support.kinds.${id}.body`)}
                  </p>
                </button>
              )
            })}
          </div>

          <form
            className="mt-[22px] flex flex-col gap-[20px] rounded-[22px] border border-border-default bg-surface-default p-[30px]"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="grid gap-[16px] sm:grid-cols-2">
              <Field label={t('support.aboutLabel')} htmlFor="about">
                <Select id="about" defaultValue="orders">
                  <option value="orders">{t('support.topics.orders')}</option>
                  <option value="tickets">{t('support.topics.tickets')}</option>
                  <option value="account">{t('support.topics.account')}</option>
                  <option value="other">{t('support.topics.other')}</option>
                </Select>
              </Field>
              <div>
                <p className="mb-[8px] text-[13px] font-semibold text-ink-primary">
                  {t('support.urgencyLabel')}
                </p>
                <div className="flex gap-[8px]">
                  {URGENCY_IDS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setUrgency(level)}
                      className={cn(
                        'flex h-[46px] flex-1 items-center justify-center rounded-[12px] text-[13.5px] font-semibold',
                        urgency === level
                          ? 'bg-brand-gradient text-ink-inverse'
                          : 'border border-border-default bg-surface-default text-ink-primary',
                      )}
                    >
                      {t(`support.urgency.${level}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Field label={t('support.subjectLabel')} htmlFor="subject">
              <TextInput
                id="subject"
                placeholder={t('support.subjectPlaceholder')}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
            </Field>

            <Field label={t('support.detailsLabel')} htmlFor="details">
              <Textarea
                id="details"
                rows={5}
                placeholder={t('support.detailsPlaceholder')}
                value={details}
                onChange={(event) => setDetails(event.target.value)}
              />
            </Field>

            <div className="grid gap-[16px] sm:grid-cols-2">
              <Field
                label={
                  <>
                    {t('support.linkLabel')}{' '}
                    <span className="font-medium text-ink-muted">{t('support.optional')}</span>
                  </>
                }
                htmlFor="link"
              >
                <Select id="link" defaultValue="">
                  <option value="">{t('support.linkNone')}</option>
                  <option value="MT-2026-84193">MT-2026-84193 · Winter Nights</option>
                  <option value="MT-2026-84702">MT-2026-84702 · Warehouse Set</option>
                </Select>
              </Field>
              <div>
                <p className="mb-[8px] text-[13px] font-semibold text-ink-primary">
                  {t('support.attachmentLabel')}{' '}
                  <span className="font-medium text-ink-muted">{t('support.optional')}</span>
                </p>
                <button
                  type="button"
                  className="flex h-[46px] w-full items-center justify-center gap-[6px] rounded-[12px] border-[1.5px] border-dashed border-border-dashed bg-bg-page text-[13.5px] font-semibold text-ink-secondary"
                >
                  <PlusIcon size={14} weight="bold" />
                  {t('support.addAttachment')}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-[12px]">
              <Button type="submit" size="lg" loading={sendState.isLoading}>
                {t('support.submit')}
              </Button>
              <p className="text-[13px] text-ink-muted">{t('support.replySla')}</p>
            </div>
          </form>
        </div>
      </PageSection>
    </>
  )
}
