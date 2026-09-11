import { useMemo, useState } from 'react'
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
import { apiErrorMessage } from '@/lib/api/unwrap'

const STEPS = ['Account', 'The business', 'Services', 'Credentials & work', 'Review'] as const

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
  const { roleLabel } = useLocale()
  const vendor = roleLabel('vendor')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [applyVendor, applyState] = useApplyVendorMutation()
  const { data: apiCities } = useGetCitiesQuery()
  const { data: apiServices } = useGetOfferedServicesQuery()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<VendorDraft>(EMPTY_DRAFT)

  const serviceOptions = useMemo(
    () => mapApiIdLabelOptions(apiServices, FALLBACK_SERVICES),
    [apiServices],
  )

  const cityOptions = useMemo(
    () => mapApiIdLabelOptions(apiCities, FALLBACK_CITIES),
    [apiCities],
  )

  const lastStep = STEPS.length - 1
  const cityLabel =
    cityOptions.find((city) => city.value === draft.cityId)?.label ?? draft.cityId
  const serviceLabels = draft.services.map(
    (value) => serviceOptions.find((option) => option.value === value)?.label ?? value,
  )

  function patch(partial: Partial<VendorDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }))
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
      dispatch(toastPushed('success', 'Vendor request submitted'))
      navigate('/application-submitted?role=vendor')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not submit request')))
    }
  }

  function handleClear() {
    setDraft(EMPTY_DRAFT)
    setStep(0)
  }

  return (
    <FormWizardShell
      eyebrow={`${vendor} request`}
      title={`Submit a ${vendor} request.`}
      subtitle="Tell us about your services. Our team reviews every request — typically 2–5 working days. You stay signed in as a guest; acceptance does not unlock a separate login."
      notice={
        <p>
          <span className="font-bold text-ink-brand-strong">Admin review only.</span> If accepted,
          we contact you outside the platform when we need your services — there is no in-app
          browse-and-book flow.
        </p>
      }
      steps={[...STEPS]}
      activeStep={step}
      backDisabled={step === 0}
      onBack={() => setStep((prev) => Math.max(0, prev - 1))}
      onContinue={() => void handleContinue()}
      continueLabel={
        step === lastStep
          ? applyState.isLoading
            ? 'Submitting…'
            : 'Submit request'
          : 'Continue'
      }
      trackHref="/my-vendor-application"
      trackLabel={`Track your ${vendor} request`}
      onClear={handleClear}
    >
      {step === 0 && (
        <AccountDonePanel subtitle="Your guest account stays a guest. Tickets, wallet and reviews stay untouched — this form is a request only." />
      )}

      {step === 1 && (
        <div className="flex flex-col gap-xl">
          <Field label="Business / trading name" htmlFor="vendor-business-name">
            <TextInput
              id="vendor-business-name"
              value={draft.businessName}
              onChange={(event) => patch({ businessName: event.target.value })}
              placeholder="e.g. Nova Stage Systems"
            />
          </Field>
          <Field label="Primary city" htmlFor="vendor-city">
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
          <Field label="Business address" htmlFor="vendor-address">
            <TextInput
              id="vendor-address"
              value={draft.address}
              onChange={(event) => patch({ address: event.target.value })}
              placeholder="Street, district, city"
            />
          </Field>
          <Field label="Tell us about the business" htmlFor="vendor-story">
            <Textarea
              id="vendor-story"
              rows={4}
              value={draft.story}
              onChange={(event) => patch({ story: event.target.value })}
              placeholder="What you deliver, who you usually work with, and a recent job you're proud of."
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-xl">
          <ChipMultiSelect
            label="Services you provide"
            hint="Pick everything you can deliver on a show night."
            options={serviceOptions}
            value={draft.services}
            onChange={(services) => patch({ services })}
          />
          <ChipMultiSelect
            label="Coverage area"
            hint="Where can you actually show up?"
            options={cityOptions}
            value={draft.coverage}
            onChange={(coverage) => patch({ coverage })}
          />
          <Field label="Primary contact name" htmlFor="vendor-contact">
            <TextInput
              id="vendor-contact"
              value={draft.contactName}
              onChange={(event) => patch({ contactName: event.target.value })}
              placeholder="Name of the person we should call"
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-xl">
          <Field label="Commercial registration (CR) number" htmlFor="vendor-cr">
            <TextInput
              id="vendor-cr"
              value={draft.crNumber}
              onChange={(event) => patch({ crNumber: event.target.value })}
              placeholder="e.g. 202405043"
            />
          </Field>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              Business licence or credentials
            </p>
            <FileDropButton
              label="Upload licence or credential"
              hint="PDF or image · max 10 MB"
              accept="image/*,.pdf"
              fileName={draft.logo?.name}
              onFiles={(files) => patch({ logo: files[0] })}
            />
          </div>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              Photos of previous work
            </p>
            <FileDropButton
              label="Add at least one work photo"
              hint="Shows of stages, catering setups, security posts — real jobs"
              icon="plus"
              accept="image/*"
              multiple
              fileName={
                draft.workPhotos.length
                  ? `${draft.workPhotos.length} file${draft.workPhotos.length > 1 ? 's' : ''} selected`
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
                label: 'Business',
                value: draft.businessName.trim() || 'Not set yet',
              },
              { label: 'City', value: cityLabel },
              { label: 'Services', value: joinOrDash(serviceLabels) },
              {
                label: 'Coverage',
                value: joinOrDash(
                  draft.coverage.map(
                    (id) => cityOptions.find((city) => city.value === id)?.label ?? id,
                  ),
                ),
              },
              {
                label: 'Contact',
                value: draft.contactName.trim() || 'Not set yet',
              },
              {
                label: 'CR number',
                value: draft.crNumber.trim() || 'Not set yet',
              },
            ]}
          />
          <ReviewTerms
            checked={draft.terms}
            onCheckedChange={(terms) => patch({ terms })}
            label="I confirm this information is accurate. I understand acceptance does not create a vendor login, and contact after review happens outside MyTicket."
          />
        </div>
      )}
    </FormWizardShell>
  )
}
