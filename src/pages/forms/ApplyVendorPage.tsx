import { useState } from 'react'
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

const STEPS = ['Account', 'The business', 'Services', 'Credentials & work', 'Review'] as const

const SERVICE_OPTIONS = [
  'Sound',
  'Lighting',
  'Staging',
  'Catering',
  'Security',
  'AV / LED',
  'Decor',
  'Transport',
] as const

const CITY_OPTIONS = [
  'Riyadh',
  'Jeddah',
  'Dammam',
  'Khobar',
  'AlUla',
  'Abha',
  'Nationwide',
] as const

type VendorDraft = {
  businessName: string
  region: string
  city: string
  story: string
  services: string[]
  coverage: string[]
  contactName: string
  idNumber: string
  terms: boolean
}

const EMPTY_DRAFT: VendorDraft = {
  businessName: '',
  region: 'riyadh-region',
  city: 'riyadh',
  story: '',
  services: [],
  coverage: [],
  contactName: '',
  idNumber: '',
  terms: false,
}

/** Apply vendor — multi-step request for admin review; guest login unchanged. */
export function ApplyVendorPage() {
  const { roleLabel } = useLocale()
  const vendor = roleLabel('vendor')
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<VendorDraft>(EMPTY_DRAFT)

  const lastStep = STEPS.length - 1
  const regionLabel =
    draft.region === 'makkah'
      ? 'Makkah Region'
      : draft.region === 'eastern'
        ? 'Eastern Province'
        : 'Riyadh Region'
  const cityLabel =
    draft.city === 'jeddah'
      ? 'Jeddah'
      : draft.city === 'dammam'
        ? 'Dammam'
        : draft.city === 'diriyah'
          ? 'Diriyah'
          : 'Riyadh'

  function patch(partial: Partial<VendorDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }))
  }

  function handleContinue() {
    if (step < lastStep) {
      setStep((prev) => prev + 1)
      return
    }
    navigate('/application-submitted?role=vendor')
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
      onContinue={handleContinue}
      continueLabel={step === lastStep ? 'Submit request' : 'Continue'}
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
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">Where are you based?</p>
            <div className="grid gap-md sm:grid-cols-2">
              <Select
                value={draft.region}
                onChange={(event) => patch({ region: event.target.value })}
                aria-label="Region"
              >
                <option value="riyadh-region">Riyadh Region</option>
                <option value="makkah">Makkah Region</option>
                <option value="eastern">Eastern Province</option>
              </Select>
              <Select
                value={draft.city}
                onChange={(event) => patch({ city: event.target.value })}
                aria-label="City"
              >
                <option value="riyadh">Riyadh</option>
                <option value="diriyah">Diriyah</option>
                <option value="jeddah">Jeddah</option>
                <option value="dammam">Dammam</option>
              </Select>
            </div>
          </div>
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
            options={SERVICE_OPTIONS}
            value={draft.services}
            onChange={(services) => patch({ services })}
          />
          <ChipMultiSelect
            label="Coverage area"
            hint="Where can you actually show up?"
            options={CITY_OPTIONS}
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
          <Field label="Government ID / Iqama of the responsible person" htmlFor="vendor-id">
            <TextInput
              id="vendor-id"
              value={draft.idNumber}
              onChange={(event) => patch({ idNumber: event.target.value })}
              placeholder="National ID or Iqama number"
            />
          </Field>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              Business licence or credentials
            </p>
            <FileDropButton
              label="Upload licence or credential"
              hint="PDF or image · max 10 MB"
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
              { label: 'Location', value: `${cityLabel}, ${regionLabel}` },
              { label: 'Services', value: joinOrDash(draft.services) },
              { label: 'Coverage', value: joinOrDash(draft.coverage) },
              {
                label: 'Contact',
                value: draft.contactName.trim() || 'Not set yet',
              },
              {
                label: 'ID on file',
                value: draft.idNumber.trim() ? 'Provided' : 'Not set yet',
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
