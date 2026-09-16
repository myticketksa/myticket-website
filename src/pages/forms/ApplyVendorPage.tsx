import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Field,
  FileDropButton,
  Select,
  TextInput,
  Textarea,
} from '@/components/ui'
import { FormWizardShell } from '@/pages/_account/FormWizard'
import {
  AccountDonePanel,
  ReviewSummary,
  ReviewTerms,
} from '@/pages/forms/apply-shared'
import { useLocale } from '@/i18n/locale'
import { useApplyVendorMutation, useGetCitiesQuery } from '@/app/api/accountApis'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAuthUser } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { mapApiIdLabelOptions, type IdLabelOption } from '@/lib/api/formPayload'
import { clearDraft, loadDraft, saveDraft } from '@/lib/forms/draftStorage'
import { apiErrorMessage } from '@/lib/api/unwrap'

const STEP_KEYS = ['account', 'business', 'services', 'credentials', 'review'] as const

const FALLBACK_CITIES: IdLabelOption[] = [
  { value: '1', label: 'Riyadh' },
  { value: '2', label: 'Jeddah' },
  { value: '3', label: 'Dammam' },
  { value: '4', label: 'Khobar' },
]

type VendorDraft = {
  email: string
  phone: string
  businessName: string
  cityId: string
  address: string
  crNumber: string
  serviceName: string
  serviceDescription: string
  /** `business[logo]` — required */
  logo?: File
  /** `business[personalPhoto]` — optional */
  personalPhoto?: File
  terms: boolean
}

/** Apply vendor — FormData keys match Postman `POST /applications/vendor`. */
export function ApplyVendorPage() {
  const { t } = useTranslation(['forms', 'common'])
  const { roleLabel } = useLocale()
  const vendor = roleLabel('vendor')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const [applyVendor, applyState] = useApplyVendorMutation()
  const { data: apiCities } = useGetCitiesQuery()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<VendorDraft>(() => ({
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    businessName: '',
    cityId: '1',
    address: '',
    crNumber: '',
    serviceName: '',
    serviceDescription: '',
    logo: undefined,
    personalPhoto: undefined,
    terms: false,
  }))
  const [draftSaved, setDraftSaved] = useState(false)
  const [restoredNote, setRestoredNote] = useState(false)

  const steps = useMemo(
    () => STEP_KEYS.map((key) => t(`forms:vendor.steps.${key}`)),
    [t],
  )

  useEffect(() => {
    const stored = loadDraft<Record<string, unknown>>('vendor')
    if (!stored) return
    setStep(Math.min(stored.step, STEP_KEYS.length - 1))
    setDraft((prev) => ({
      ...prev,
      ...(stored.draft as Partial<VendorDraft>),
      email: String(stored.draft.email ?? prev.email ?? user?.email ?? ''),
      phone: String(stored.draft.phone ?? prev.phone ?? user?.phone ?? ''),
      logo: undefined,
      personalPhoto: undefined,
      terms: Boolean(stored.draft.terms),
    }))
    setRestoredNote(true)
  }, [user?.email, user?.phone])

  const cityOptions = useMemo(
    () => mapApiIdLabelOptions(apiCities, FALLBACK_CITIES),
    [apiCities],
  )

  const lastStep = STEP_KEYS.length - 1
  const cityLabel =
    cityOptions.find((city) => city.value === draft.cityId)?.label ?? draft.cityId

  function patch(partial: Partial<VendorDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }))
  }

  function handleSaveExit() {
    saveDraft('vendor', step, draft as unknown as Record<string, unknown>)
    setDraftSaved(true)
    dispatch(toastPushed('success', t('common:draft.savedToast')))
    navigate('/')
  }

  function validateStep(current: number): string | null {
    if (current === 0) {
      if (!draft.email.trim()) return t('forms:vendor.validation.email')
      if (!draft.phone.trim()) return t('forms:vendor.validation.phone')
      return null
    }
    if (current === 1) {
      if (!draft.businessName.trim()) return t('forms:vendor.validation.businessName')
      if (!draft.cityId) return t('forms:vendor.validation.city')
      if (!draft.address.trim()) return t('forms:vendor.validation.address')
      return null
    }
    if (current === 2) {
      if (!draft.serviceName.trim()) return t('forms:vendor.validation.serviceName')
      if (!draft.serviceDescription.trim()) {
        return t('forms:vendor.validation.serviceDescription')
      }
      return null
    }
    if (current === 3) {
      if (!draft.crNumber.trim()) return t('forms:vendor.validation.cr')
      if (!draft.logo) return t('forms:vendor.validation.logo')
      return null
    }
    if (current === lastStep) {
      if (!draft.terms) return t('forms:vendor.validation.terms')
      return null
    }
    return null
  }

  async function handleContinue() {
    const error = validateStep(step)
    if (error) {
      dispatch(toastPushed('error', error))
      return
    }

    if (step < lastStep) {
      setStep((prev) => prev + 1)
      return
    }

    const body = new FormData()
    body.append('business[tradeName]', draft.businessName.trim())
    body.append('business[CRnumber]', draft.crNumber.trim())
    body.append('business[primaryCity]', draft.cityId)
    body.append('business[address]', draft.address.trim())
    body.append('service[name]', draft.serviceName.trim())
    body.append('service[description]', draft.serviceDescription.trim())
    if (draft.logo) body.append('business[logo]', draft.logo)
    if (draft.personalPhoto) body.append('business[personalPhoto]', draft.personalPhoto)
    body.append('contacts[email]', draft.email.trim())
    body.append('contacts[phone]', draft.phone.trim())

    try {
      await applyVendor(body).unwrap()
      clearDraft('vendor')
      dispatch(toastPushed('success', t('forms:vendor.success')))
      navigate('/application-submitted?role=vendor')
    } catch (err) {
      dispatch(toastPushed('error', apiErrorMessage(err, t('forms:vendor.error'))))
    }
  }

  function handleClear() {
    clearDraft('vendor')
    setDraft({
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      businessName: '',
      cityId: '1',
      address: '',
      crNumber: '',
      serviceName: '',
      serviceDescription: '',
      logo: undefined,
      personalPhoto: undefined,
      terms: false,
    })
    setStep(0)
    setDraftSaved(false)
    setRestoredNote(false)
  }

  return (
    <FormWizardShell
      eyebrow={t('forms:vendor.eyebrow', { role: vendor })}
      title={t('forms:vendor.title', { role: vendor })}
      subtitle={t('forms:vendor.subtitle')}
      draftSaved={draftSaved}
      notice={
        <p>
          {t('forms:vendor.notice')}
          {restoredNote ? (
            <>
              {' '}
              <span className="text-ink-secondary">{t('common:draft.restoredNote')}</span>
            </>
          ) : null}
        </p>
      }
      steps={steps}
      activeStep={step}
      backDisabled={step === 0}
      onBack={() => setStep((prev) => Math.max(0, prev - 1))}
      onContinue={() => void handleContinue()}
      continueLabel={
        step === lastStep
          ? applyState.isLoading
            ? t('common:states.submitting')
            : t('forms:vendor.submit')
          : t('common:actions.continue')
      }
      trackHref="/my-vendor-application"
      trackLabel={t('forms:vendor.track', { role: vendor })}
      onClear={handleClear}
      onSaveExit={handleSaveExit}
    >
      {step === 0 && (
        <div className="flex flex-col gap-xl">
          <AccountDonePanel subtitle={t('forms:accountDone.subtitle')} />
          <Field label={t('forms:vendor.fields.email')} htmlFor="vendor-email">
            <TextInput
              id="vendor-email"
              type="email"
              value={draft.email}
              onChange={(event) => patch({ email: event.target.value })}
              placeholder={t('forms:vendor.fields.emailPlaceholder')}
              autoComplete="email"
            />
          </Field>
          <Field label={t('forms:vendor.fields.phone')} htmlFor="vendor-phone">
            <TextInput
              id="vendor-phone"
              type="tel"
              value={draft.phone}
              onChange={(event) => patch({ phone: event.target.value })}
              placeholder={t('forms:vendor.fields.phonePlaceholder')}
              autoComplete="tel"
            />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-xl">
          <Field label={t('forms:vendor.fields.businessName')} htmlFor="vendor-business-name">
            <TextInput
              id="vendor-business-name"
              value={draft.businessName}
              onChange={(event) => patch({ businessName: event.target.value })}
              placeholder={t('forms:vendor.fields.businessPlaceholder')}
            />
          </Field>
          <Field label={t('forms:vendor.fields.city')} htmlFor="vendor-city">
            <Select
              id="vendor-city"
              value={draft.cityId}
              onChange={(event) => patch({ cityId: event.target.value })}
            >
              {cityOptions.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('forms:vendor.fields.address')} htmlFor="vendor-address">
            <TextInput
              id="vendor-address"
              value={draft.address}
              onChange={(event) => patch({ address: event.target.value })}
              placeholder={t('forms:vendor.fields.addressPlaceholder')}
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-xl">
          <Field label={t('forms:vendor.fields.serviceName')} htmlFor="vendor-service-name">
            <TextInput
              id="vendor-service-name"
              value={draft.serviceName}
              onChange={(event) => patch({ serviceName: event.target.value })}
              placeholder={t('forms:vendor.fields.serviceNamePlaceholder')}
            />
          </Field>
          <Field
            label={t('forms:vendor.fields.serviceDescription')}
            htmlFor="vendor-service-description"
          >
            <Textarea
              id="vendor-service-description"
              rows={4}
              value={draft.serviceDescription}
              onChange={(event) => patch({ serviceDescription: event.target.value })}
              placeholder={t('forms:vendor.fields.serviceDescriptionPlaceholder')}
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-xl">
          <Field label={t('forms:vendor.fields.cr')} htmlFor="vendor-cr">
            <TextInput
              id="vendor-cr"
              value={draft.crNumber}
              onChange={(event) => patch({ crNumber: event.target.value })}
              placeholder={t('forms:vendor.fields.crPlaceholder')}
            />
          </Field>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              {t('forms:vendor.fields.logoTitle')}
            </p>
            <FileDropButton
              label={t('forms:vendor.fields.logoUpload')}
              hint={t('forms:vendor.fields.logoHint')}
              accept="image/png,image/jpeg,image/webp,image/*"
              fileName={draft.logo?.name}
              onFiles={(files) => patch({ logo: files[0] })}
            />
          </div>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              {t('forms:vendor.fields.personalPhotoTitle')}
            </p>
            <FileDropButton
              label={t('forms:vendor.fields.personalPhotoUpload')}
              hint={t('forms:vendor.fields.personalPhotoHint')}
              accept="image/png,image/jpeg,image/webp,image/*"
              fileName={draft.personalPhoto?.name}
              onFiles={(files) => patch({ personalPhoto: files[0] })}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-xl">
          <ReviewSummary
            rows={[
              {
                label: t('forms:vendor.fields.reviewEmail'),
                value: draft.email.trim() || t('forms:review.notSet'),
              },
              {
                label: t('forms:vendor.fields.reviewPhone'),
                value: draft.phone.trim() || t('forms:review.notSet'),
              },
              {
                label: t('forms:vendor.fields.reviewBusiness'),
                value: draft.businessName.trim() || t('forms:review.notSet'),
              },
              { label: t('forms:vendor.fields.reviewCity'), value: cityLabel },
              {
                label: t('forms:vendor.fields.reviewAddress'),
                value: draft.address.trim() || t('forms:review.notSet'),
              },
              {
                label: t('forms:vendor.fields.reviewService'),
                value: draft.serviceName.trim() || t('forms:review.notSet'),
              },
              {
                label: t('forms:vendor.fields.reviewCr'),
                value: draft.crNumber.trim() || t('forms:review.notSet'),
              },
              {
                label: t('forms:vendor.fields.reviewLogo'),
                value: draft.logo ? t('forms:review.provided') : t('forms:review.notSet'),
              },
              {
                label: t('forms:vendor.fields.reviewPersonalPhoto'),
                value: draft.personalPhoto
                  ? t('forms:review.provided')
                  : t('forms:review.optionalSkip'),
              },
            ]}
          />
          <ReviewTerms
            checked={draft.terms}
            onCheckedChange={(terms) => patch({ terms })}
            label={t('forms:vendor.fields.confirm')}
          />
        </div>
      )}
    </FormWizardShell>
  )
}
