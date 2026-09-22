import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button, Checkbox, Field, TextInput } from '@/components/ui'
import { PageSection } from '@/layouts'
import { useLocale } from '@/i18n/locale'

type DeleteStep = { title: string; body: string }

type DeletionOutcome =
  | { kind: 'success' }
  | { kind: 'invalid_credentials' }
  | { kind: 'blocked'; blockers: string[] }
  | { kind: 'error' }

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000') as string

/**
 * `POST /account-deletion/no-auth` { email, password } — the public,
 * no-login deletion endpoint. Called with plain `fetch` (not the RTK Query
 * `baseApi`) because a wrong email/password doesn't get a JSON 4xx: the
 * backend answers it with a same-origin redirect (a web-context `back()`
 * call that leaked into this API-context endpoint). The default
 * follow-redirect fetch behaviour would land on the API's 200 HTML root
 * page and read that as success. `redirect: 'manual'` surfaces the
 * redirect as an opaque response instead, so it can be told apart from an
 * actual successful deletion (200, empty body).
 */
async function requestAccountDeletion(email: string, password: string): Promise<DeletionOutcome> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}/account-deletion/no-auth`, {
      method: 'POST',
      redirect: 'manual',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    return { kind: 'error' }
  }

  if (response.type === 'opaqueredirect' || response.status === 0) {
    return { kind: 'invalid_credentials' }
  }

  if (response.status === 400) {
    const body = (await response.json().catch(() => null)) as { data?: unknown } | null
    const blockers = Array.isArray(body?.data) ? (body.data as string[]) : []
    return { kind: 'blocked', blockers }
  }

  if (response.ok) return { kind: 'success' }

  return { kind: 'error' }
}

/**
 * Public account/data deletion page — required by Google Play's User Data
 * policy: a web page, reachable without installing the app, describing how
 * to delete an account and what happens to the data. Two real paths: signed
 * in, through Settings (`useDeleteAccountMutation`); or from here directly,
 * via the no-auth endpoint below, for anyone who can't sign in.
 *
 * Always English: this exact URL is what Google reviews, so it can't render
 * in Arabic from a stored locale preference. `setLocale('en')` flips the
 * whole app (header/footer included, not just this page's own text) since
 * those read the same global i18n instance — `{ lng: 'en' }` on this page's
 * own `t()` calls additionally avoids a one-frame flash of Arabic before
 * that effect commits.
 */
export function DeleteAccountPage() {
  const { t } = useTranslation('marketing')
  const { setLocale } = useLocale()
  useEffect(() => {
    setLocale('en')
  }, [setLocale])
  const steps = t('deleteAccount.steps', { returnObjects: true, lng: 'en' }) as DeleteStep[]

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [outcome, setOutcome] = useState<DeletionOutcome | null>(null)

  const canSubmit = email.trim() !== '' && password !== '' && confirmed && !submitting

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setOutcome(null)
    const result = await requestAccountDeletion(email.trim(), password)
    setSubmitting(false)
    setOutcome(result)
    if (result.kind === 'success') {
      setPassword('')
      setConfirmed(false)
    }
  }

  return (
    <div dir="ltr" lang="en">
      <PageSection padTop={64} padBottom={0}>
        <h1 className="max-w-[720px] text-[32px] leading-[1.05] font-extrabold tracking-[-1.5px] text-ink-primary sm:text-[42px]">
          {t('deleteAccount.title', { lng: 'en' })}
        </h1>
        <p className="mt-[12px] max-w-[640px] text-[16px] leading-[1.6] text-ink-secondary">
          {t('deleteAccount.lede', { lng: 'en' })}
        </p>
      </PageSection>

      <PageSection padTop={36} padBottom={40}>
        <div className="flex flex-col gap-[14px] sm:max-w-[640px]">
          {(Array.isArray(steps) ? steps : []).map((step, index) => (
            <div
              key={step.title}
              className="flex gap-[16px] rounded-[16px] border border-border-default bg-surface-default px-[22px] py-[18px]"
            >
              <span className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-bg-tint-brand text-[13px] font-bold text-ink-brand">
                {index + 1}
              </span>
              <div>
                <h2 className="text-[15.5px] font-bold text-ink-primary">{step.title}</h2>
                <p className="mt-[4px] text-[14px] leading-[1.6] text-ink-secondary">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <Link to="/settings" className="mt-[22px] inline-block">
          <Button size="lg">{t('deleteAccount.cta', { lng: 'en' })}</Button>
        </Link>
      </PageSection>

      <PageSection padTop={0} padBottom={96}>
        <div className="max-w-[640px] rounded-[18px] border border-border-default bg-bg-page px-[24px] py-[20px]">
          <h2 className="text-[15.5px] font-bold text-ink-primary">
            {t('deleteAccount.whatGoesTitle', { lng: 'en' })}
          </h2>
          <p className="mt-[6px] text-[14px] leading-[1.7] text-ink-secondary">
            {t('deleteAccount.whatGoesBody', { lng: 'en' })}
          </p>
        </div>

        <div className="mt-[14px] max-w-[640px] rounded-[18px] border border-border-default bg-bg-page px-[24px] py-[24px]">
          <h2 className="text-[15.5px] font-bold text-ink-primary">
            {t('deleteAccount.noAccessTitle', { lng: 'en' })}
          </h2>
          <p className="mt-[6px] text-[14px] leading-[1.7] text-ink-secondary">
            {t('deleteAccount.noAccessBody', { lng: 'en' })}
          </p>

          {outcome?.kind === 'success' ? (
            <div className="mt-[18px] rounded-[14px] border border-border-default bg-bg-tint-brand px-[18px] py-[16px]">
              <p className="text-[14.5px] font-bold text-ink-primary">
                {t('deleteAccount.form.successTitle', { lng: 'en' })}
              </p>
              <p className="mt-[4px] text-[13.5px] leading-[1.6] text-ink-secondary">
                {t('deleteAccount.form.successBody', { lng: 'en' })}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-[18px] flex flex-col gap-[14px]">
              <Field label={t('deleteAccount.form.emailLabel', { lng: 'en' })} htmlFor="delete-email">
                <TextInput
                  id="delete-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('deleteAccount.form.emailPlaceholder', { lng: 'en' }) ?? undefined}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>

              <Field
                label={t('deleteAccount.form.passwordLabel', { lng: 'en' })}
                htmlFor="delete-password"
              >
                <TextInput
                  id="delete-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('deleteAccount.form.passwordPlaceholder', { lng: 'en' }) ?? undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Field>

              <Checkbox
                id="delete-confirm"
                label={t('deleteAccount.form.confirmLabel', { lng: 'en' })}
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked === true)}
              />

              {outcome?.kind === 'invalid_credentials' && (
                <p className="rounded-[12px] border border-state-danger-border bg-state-danger-tint px-[14px] py-[11px] text-[13.5px] font-medium text-state-danger-deep">
                  {t('deleteAccount.form.invalidCredentials', { lng: 'en' })}
                </p>
              )}

              {outcome?.kind === 'blocked' && (
                <div className="rounded-[12px] border border-state-danger-border bg-state-danger-tint px-[14px] py-[12px]">
                  <p className="text-[13.5px] font-bold text-state-danger-deep">
                    {t('deleteAccount.form.blockedTitle', { lng: 'en' })}
                  </p>
                  <p className="mt-[2px] text-[13px] text-ink-secondary">
                    {t('deleteAccount.form.blockedIntro', { lng: 'en' })}
                  </p>
                  <ul className="mt-[6px] list-disc ps-[18px]">
                    {outcome.blockers.map((code) => (
                      <li key={code} className="text-[13px] leading-[1.6] text-ink-secondary">
                        {t(`deleteAccount.form.blockers.${code}`, {
                          lng: 'en',
                          defaultValue: code,
                        })}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {outcome?.kind === 'error' && (
                <p className="rounded-[12px] border border-state-danger-border bg-state-danger-tint px-[14px] py-[11px] text-[13.5px] font-medium text-state-danger-deep">
                  {t('deleteAccount.form.genericError', { lng: 'en' })}
                </p>
              )}

              <Button type="submit" size="lg" loading={submitting} disabled={!canSubmit}>
                {submitting
                  ? t('deleteAccount.form.submitting', { lng: 'en' })
                  : t('deleteAccount.form.submit', { lng: 'en' })}
              </Button>
            </form>
          )}

          <p className="mt-[16px] text-[13px] text-ink-muted">
            {t('deleteAccount.form.mailFallback', { lng: 'en' })}{' '}
            <a href="mailto:privacy@myticket.sa" className="font-semibold text-ink-brand">
              privacy@myticket.sa
            </a>
          </p>
        </div>
      </PageSection>
    </div>
  )
}
