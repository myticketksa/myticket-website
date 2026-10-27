import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckIcon } from '@/components/icons'
import { Button, Field, MultiSelectDropdown, TextInput, Textarea } from '@/components/ui'
import { useLocale } from '@/i18n/locale'
import { FunnelHeader, PageSection } from '@/layouts'
import { useApplyOrganizerMutation, useGetCitiesQuery, useGetMyApplicationQuery } from '@/app/api/accountApis'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAuthUser } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { useRequireAuth } from '@/lib/auth/useRequireAuth'
import { mapCityOptions } from '@/lib/api/mappers/cities'
import type { IdLabelOption } from '@/lib/api/formPayload'
import { apiErrorMessage } from '@/lib/api/unwrap'
import { catalogLabel } from '@/lib/i18n/catalogLabels'

const STEP_KEYS = ['request', 'call', 'dashboard'] as const
const DASHBOARD_URL = 'https://business.myticket.sa'
const FALLBACK_CITIES: IdLabelOption[] = [
  { value: '1', label: 'Riyadh' },
  { value: '2', label: 'Jeddah' },
  { value: '4', label: 'Dammam' },
  { value: '9', label: 'Khobar' },
]

/** "0501234567" / "501234567" / "+966 50 123 4567" → "966501234567"; '' when it isn't a Saudi mobile. */
function saudiMobile(value: string): string {
  const digits = value.replace(/\D/g, '').replace(/^00/, '')
  const local = digits.startsWith('966') ? digits.slice(3) : digits.replace(/^0/, '')
  return /^5\d{8}$/.test(local) ? `966${local}` : ''
}

type Application = { type?: string; application?: Record<string, unknown> }

/**
 * Becoming an organizer (27 Oct 2026) — the same flow as the app's
 * Facilities tab: a short request (name, city, mobile), MyTicket calls to
 * agree the terms (the office step stays), and once approved the same account
 * signs in to the organizer dashboard. Signed in, the page shows the form or
 * where the request stands.
 */
export function ApplyOrganizerPage() {
  const { t } = useTranslation('forms')
  const { t: tCatalog } = useTranslation('catalog')
  const { roleLabel } = useLocale()
  const organizer = roleLabel('organizer')
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const { isAuthenticated, requireAuth } = useRequireAuth()
  const { data: mine, isLoading } = useGetMyApplicationQuery(undefined, { skip: !isAuthenticated, refetchOnMountOrArgChange: true })
  const { data: apiCities } = useGetCitiesQuery(undefined, { skip: !isAuthenticated })
  const [applyOrganizer, applyState] = useApplyOrganizerMutation()

  const [name, setName] = useState('')
  const [cityId, setCityId] = useState('')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [crNumber, setCrNumber] = useState('')
  const [about, setAbout] = useState('')
  const [reapplying, setReapplying] = useState(false)

  const cityOptions = useMemo(
    () => mapCityOptions(apiCities, FALLBACK_CITIES).map((city) => ({ ...city, label: catalogLabel(tCatalog, city.label) })),
    [apiCities, tCatalog],
  )

  const applications = (mine?.applications as Application[] | undefined) ?? (mine?.type ? [mine as Application] : [])
  const request = applications.find((a) => a.type === 'organizer')?.application
  const other = applications.find((a) => a.type !== 'organizer' && ['pending', 'approved'].includes(String(a.application?.status)))
  const status = user?.role === 'organizer' ? 'approved' : (request?.status as string | undefined)
  const requestName = (request?.publicPresence as { publicName?: string } | undefined)?.publicName ?? ''

  const steps = STEP_KEYS.map((key) => ({ title: t(`organizer.steps.${key}.title`), body: t(`organizer.steps.${key}.body`) }))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const mobile = saudiMobile(phone)
    if (name.trim().length < 2) return void dispatch(toastPushed('error', t('organizer.fields.nameRequired')))
    if (!cityId) return void dispatch(toastPushed('error', t('organizer.fields.cityRequired')))
    if (!mobile) return void dispatch(toastPushed('error', t('organizer.fields.phoneInvalid')))

    const body = new FormData()
    body.append('publicPresence[publicName]', name.trim())
    body.append('entity[regions][]', cityId)
    body.append('entity[contactPhone]', mobile)
    if (crNumber.trim()) body.append('entity[registrationNumber]', crNumber.trim())
    if (about.trim()) body.append('publicPresence[biography]', about.trim())
    try {
      await applyOrganizer(body).unwrap()
      setReapplying(false)
      dispatch(toastPushed('success', t('organizer.success')))
    } catch (err) {
      dispatch(toastPushed('error', apiErrorMessage(err, t('organizer.error'))))
    }
  }

  const card = 'rounded-[18px] border border-border-default bg-surface-default px-[22px] py-[22px]'
  let body: React.ReactNode
  if (!isAuthenticated) {
    body = (
      <Button size="lg" className="w-full" onClick={() => requireAuth()}>
        {t('organizer.signInToApply')}
      </Button>
    )
  } else if (isLoading) {
    body = null
  } else if (status === 'approved') {
    body = (
      <div className={card}>
        <p className="text-[18px] font-bold text-ink-primary">{t('organizer.approvedTitle')}</p>
        <p className="mt-[6px] text-[14px] text-ink-secondary">{t('organizer.approvedBody')}</p>
        <a href={DASHBOARD_URL} className="mt-[16px] block">
          <Button size="lg" className="w-full">
            {t('organizer.openDashboard')}
          </Button>
        </a>
        <p className="mt-[10px] text-[13px] text-ink-secondary">{t('organizer.dashboardHint')}</p>
      </div>
    )
  } else if (status === 'pending') {
    body = (
      <div className={card}>
        <p className="text-[18px] font-bold text-ink-primary">{t('organizer.pendingTitle')}</p>
        <p className="mt-[6px] text-[14px] text-ink-secondary">{t('organizer.pendingBody', { name: requestName })}</p>
      </div>
    )
  } else if (other) {
    body = (
      <div className={card}>
        <p className="text-[15px] text-ink-secondary">{t('organizer.otherRequest')}</p>
      </div>
    )
  } else if (status === 'rejected' && !reapplying) {
    body = (
      <div className={card}>
        <p className="text-[18px] font-bold text-ink-primary">{t('organizer.rejectedTitle')}</p>
        {request?.rejectionReason ? (
          <p className="mt-[6px] text-[14px] text-ink-secondary">{t('organizer.rejectedReason', { reason: String(request.rejectionReason) })}</p>
        ) : null}
        <Button size="lg" className="mt-[16px] w-full" onClick={() => setReapplying(true)}>
          {t('organizer.applyAgain')}
        </Button>
      </div>
    )
  } else {
    body = (
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-lg">
        <div className={`flex flex-col gap-lg ${card}`}>
          <Field label={t('organizer.fields.name')} htmlFor="org-name">
            <TextInput id="org-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('organizer.fields.name')} />
          </Field>
          <MultiSelectDropdown
            multi={false}
            label={t('organizer.fields.city')}
            placeholder={t('organizer.fields.city')}
            options={cityOptions}
            value={cityId ? [cityId] : []}
            onChange={(next) => setCityId(next[0] ?? '')}
          />
          <Field label={t('organizer.fields.phone')} htmlFor="org-phone">
            <TextInput id="org-phone" type="tel" inputMode="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" />
          </Field>
          <Field label={t('organizer.fields.cr')} htmlFor="org-cr">
            <TextInput id="org-cr" inputMode="numeric" value={crNumber} onChange={(e) => setCrNumber(e.target.value)} placeholder={t('organizer.fields.cr')} />
          </Field>
          <Field label={t('organizer.fields.about')} htmlFor="org-about">
            <Textarea id="org-about" rows={3} maxLength={600} value={about} onChange={(e) => setAbout(e.target.value)} placeholder={t('organizer.fields.about')} />
          </Field>
          {user?.email ? <p className="text-[13px] text-ink-secondary">{t('organizer.emailNote', { email: user.email })}</p> : null}
        </div>
        <Button type="submit" size="lg" className="w-full" loading={applyState.isLoading}>
          {t('organizer.submit')}
        </Button>
      </form>
    )
  }

  return (
    <>
      <FunnelHeader label={t('organizer.eyebrow', { role: organizer })} backHref="/for-organizers" backLabel={t('organizer.backLabel')} />

      <PageSection padTop={48} padBottom={96}>
        <div className="mx-auto max-w-[620px]">
          <h1 className="text-[28px] leading-[1.04] font-extrabold tracking-[-1.47px] text-ink-primary sm:text-[36px] lg:text-[42px]">
            {t('organizer.title', { role: organizer })}
          </h1>
          <p className="mt-[12px] text-[16.5px] leading-[1.6] text-ink-secondary">{t('organizer.subtitle')}</p>

          <ol className="mt-[28px] flex flex-col gap-[12px]">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-[14px] rounded-[18px] border border-border-default bg-surface-default px-[20px] py-[16px]">
                <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[12px] bg-bg-tint-brand text-[14px] font-extrabold text-ink-brand">
                  {index + 1}
                </span>
                <div>
                  <p className="text-[15px] font-bold text-ink-primary">{step.title}</p>
                  <p className="mt-[2px] text-[14px] leading-[1.55] text-ink-secondary">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-[24px]">{body}</div>

          <p className="mt-[20px] flex items-start gap-[8px] text-[13px] text-ink-secondary">
            <CheckIcon size={14} weight="bold" className="mt-[3px] shrink-0 text-ink-brand" />
            <span>
              {t('organizer.learnMorePrefix')}{' '}
              <Link to="/for-organizers" className="font-semibold text-ink-brand">
                {t('organizer.forRole', { role: organizer })}
              </Link>
              .
            </span>
          </p>
        </div>
      </PageSection>
    </>
  )
}
