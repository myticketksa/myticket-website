import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  ChipMultiSelect,
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
  joinOrDash,
} from '@/pages/forms/apply-shared'
import { useLocale } from '@/i18n/locale'
import {
  useApplyVendorMutation,
  useGetCitiesQuery,
  useGetOfferedServicesQuery,
} from '@/app/api/accountApis'
import { useAppDispatch } from '@/app/hooks'
import { toastPushed } from '@/features/ui/uiSlice'
import { mapApiIdLabelOptions, type IdLabelOption } from '@/lib/api/formPayload'
import { clearDraft, loadDraft, saveDraft } from '@/lib/forms/draftStorage'
import { apiErrorMessage } from '@/lib/api/unwrap'

const STEP_KEYS = ['account', 'business', 'services', 'credentials', 'review'] as const

const FALLBACK_SERVICES: IdLabelOption[] = [
  { value: 'Sound', label: 'Sound' },
  { value: 'Lighting', label: 'Lighting' },
  { value: 'Staging', label: 'Staging' },
  { value: 'Catering', label: 'Catering' },
  { value: 'Security', label: 'Security' },
  { value: 'AV / LED', label: 'AV / LED' },
  { value: 'Decor', label: 'Decor' },
  { value: 'Transport', label: 'Transport' },
]

const FALLBACK_CITIES: IdLabelOption[] = [
  { value: '1', label: 'Riyadh' },
  { value: '2', label: 'Jeddah' },
  { value: '3', label: 'Dammam' },
  { value: '4', label: 'Khobar' },
]

type VendorDraft = {
  businessName: string
  cityId: string
  address: string
  story: string
  /** service[name] is free text in Postman — store selected service labels/names. */
  services: string[]
  coverage: string[]
  contactName: string
  crNumber: string
  /** Postman `business[logo]` */
  logo?: File
  /** Postman `business[personalPhoto]` — reused for work photos first file */
  personalPhoto?: File
  workPhotos: File[]
  terms: boolean
}

const EMPTY_DRAFT: VendorDraft = {
  businessName: '',
  cityId: '1',
  address: '',
  story: '',
  services: [],
  coverage: [],
  contactName: '',
  crNumber: '',
  logo: undefined,
  personalPhoto: undefined,
  workPhotos: [],
  terms: false,
}

/** Apply vendor — FormData keys match Postman `POST /applications/vendor`. */
export function ApplyVendorPage() {
  const { t } = useTranslation(['forms', 'common'])
  const { roleLabel } = useLocale()
  const vendor = roleLabel('vendor')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [applyVendor, applyState] = useApplyVendorMutation()
  const { data: apiCities } = useGetCitiesQuery()
  const { data: apiServices } = useGetOfferedServicesQuery()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<VendorDraft>(EMPTY_DRAFT)
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
    setDraft({
      ...EMPTY_DRAFT,
      ...(stored.draft as Partial<VendorDraft>),
      logo: undefined,
      personalPhoto: undefined,
      workPhotos: [],
      services: Array.isArray(stored.draft.services) ? (stored.draft.services as string[]) : [],
      coverage: Array.isArray(stored.draft.coverage) ? (stored.draft.coverage as string[]) : [],
      terms: Boolean(stored.draft.terms),
    })
    setRestoredNote(true)
  }, [])

  const serviceOptions = useMemo(
    () => mapApiIdLabelOptions(apiServices, FALLBACK_SERVICES),
    [apiServices],
  )

  const cityOptions = useMemo(
    () => mapApiIdLabelOptions(apiCities, FALLBACK_CITIES),
    [apiCities],
  )

  const lastStep = STEP_KEYS.length - 1
  const cityLabel =
    cityOptions.find((city) => city.value === draft.cityId)?.label ?? draft.cityId
  const serviceLabels = draft.services.map(
    (value) => serviceOptions.find((option) => option.value === value)?.label ?? value,
  )

  function patch(partial: Partial<VendorDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }))
  }

  function handleSaveExit() {
    saveDraft('vendor', step, draft as unknown as Record<string, unknown>)
    setDraftSaved(true)
    dispatch(toastPushed('success', t('common:draft.savedToast')))
    navigate('/')
  }

  async function handleContinue() {
    if (step < lastStep) {
      setStep((prev) => prev + 1)
      return
    }

    const serviceName =
      serviceLabels[0] ??
      draft.services[0] ??
      'General services'
    const serviceDescription =
      draft.story.trim() ||
      (serviceLabels.length ? serviceLabels.join(', ') : 'Vendor services')

    const body = new FormData()
    body.append('business[tradeName]', draft.businessName.trim())
    body.append('business[CRnumber]', draft.crNumber.trim() || 'pending')
    body.append('business[primaryCity]', draft.cityId)
    body.append(
      'business[address]',
      draft.address.trim() || draft.story.trim().slice(0, 120) || 'Saudi Arabia',
    )
    body.append('service[name]', serviceName)
    body.append('service[description]', serviceDescription)
    if (draft.logo) body.append('business[logo]', draft.logo)
    if (draft.personalPhoto) body.append('business[personalPhoto]', draft.personalPhoto)
    else if (draft.workPhotos[0]) body.append('business[personalPhoto]', draft.workPhotos[0])

    try {
      await applyVendor(body).unwrap()
      clearDraft('vendor')
      dispatch(toastPushed('success', t('forms:vendor.success')))
      navigate('/application-submitted?role=vendor')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('forms:vendor.error'))))
    }
  }

  function handleClear() {
    clearDraft('vendor')
    setDraft(EMPTY_DRAFT)
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
      {step === 0 && <AccountDonePanel subtitle={t('forms:accountDone.subtitle')} />}

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
          <Field label={t('forms:vendor.fields.story')} htmlFor="vendor-story">
            <Textarea
              id="vendor-story"
              rows={4}
              value={draft.story}
              onChange={(event) => patch({ story: event.target.value })}
              placeholder={t('forms:vendor.fields.storyPlaceholder')}
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-xl">
          <ChipMultiSelect
            label={t('forms:vendor.fields.services')}
            hint={t('forms:vendor.fields.servicesHint')}
            options={serviceOptions}
            value={draft.services}
            onChange={(services) => patch({ services })}
          />
          <ChipMultiSelect
            label={t('forms:vendor.fields.coverage')}
            hint={t('forms:vendor.fields.coverageHint')}
            options={cityOptions}
            value={draft.coverage}
            onChange={(coverage) => patch({ coverage })}
          />
          <Field label={t('forms:vendor.fields.contact')} htmlFor="vendor-contact">
            <TextInput
              id="vendor-contact"
              value={draft.contactName}
              onChange={(event) => patch({ contactName: event.target.value })}
              placeholder={t('forms:vendor.fields.contactPlaceholder')}
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
              {t('forms:vendor.fields.licenceTitle')}
            </p>
            <FileDropButton
              label={t('forms:vendor.fields.licenceUpload')}
              hint={t('forms:vendor.fields.licenceHint')}
              accept="image/*,.pdf"
              fileName={draft.logo?.name}
              onFiles={(files) => patch({ logo: files[0] })}
            />
          </div>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              {t('forms:vendor.fields.workTitle')}
            </p>
            <FileDropButton
              label={t('forms:vendor.fields.workUpload')}
              hint={t('forms:vendor.fields.workHint')}
              icon="plus"
              accept="image/*"
              multiple
              fileName={
                draft.workPhotos.length
                  ? t('forms:vendor.fields.filesSelected', { count: draft.workPhotos.length })
                  : draft.personalPhoto?.name
              }
              onFiles={(files) =>
                patch({
                  workPhotos: files,
                  personalPhoto: files[0] ?? draft.personalPhoto,
                })
              }
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-xl">
          <ReviewSummary
            rows={[
              {
                label: t('forms:vendor.fields.reviewBusiness'),
                value: draft.businessName.trim() || t('forms:review.notSet'),
              },
              { label: t('forms:vendor.fields.reviewCity'), value: cityLabel },
              {
                label: t('forms:vendor.fields.reviewServices'),
                value: joinOrDash(serviceLabels),
              },
              {
                label: t('forms:vendor.fields.reviewCoverage'),
                value: joinOrDash(
                  draft.coverage.map(
                    (id) => cityOptions.find((city) => city.value === id)?.label ?? id,
                  ),
                ),
              },
              {
                label: t('forms:vendor.fields.reviewContact'),
                value: draft.contactName.trim() || t('forms:review.notSet'),
              },
              {
                label: t('forms:vendor.fields.reviewCr'),
                value: draft.crNumber.trim() || t('forms:review.notSet'),
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
