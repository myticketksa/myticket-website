import { useState } from 'react'
import {
  Checkbox,
  ChipMultiSelect,
  Field,
  FileDropButton,
  Select,
  Textarea,
  TextInput,
} from '@/components/ui'
import { FormWizardShell } from '@/pages/_account/FormWizard'
import {
  AccountDonePanel,
  ReviewSummary,
  ReviewTerms,
  joinOrDash,
  useApplyWizard,
} from '@/pages/forms/apply-shared'

const STEPS = ['Account', 'The business', 'Services', 'Credentials & work', 'Review'] as const

const SERVICES = [
  'Sound',
  'Lighting',
  'Catering',
  'Security',
  'Staging',
  'Decor',
  'Photo & video',
  'Other',
] as const

/** Apply vendor — Figma `207:11368` (step labels); steps 2–5 inferred from need list. */
export function ApplyVendorPage() {
  const wizard = useApplyWizard(STEPS.length)
  const [businessName, setBusinessName] = useState('Desert Stage Co.')
  const [crNumber, setCrNumber] = useState('')
  const [city, setCity] = useState('riyadh')
  const [website, setWebsite] = useState('')
  const [story, setStory] = useState(
    'We rig sound and light for outdoor festivals across Riyadh and the Eastern Province.',
  )
  const [services, setServices] = useState<string[]>(['Sound', 'Lighting'])
  const [coverage, setCoverage] = useState('Riyadh Region')
  const [travelOk, setTravelOk] = useState(true)
  const [years, setYears] = useState('5')
  const [terms, setTerms] = useState(false)

  return (
    <FormWizardShell
      eyebrow="Vendor application"
      title="Apply to serve events."
      subtitle="Five short parts, saved as you go. Organizers hire on proof — licences and photos of real work carry the application."
      notice={
        <p>
          <span className="font-bold text-ink-brand-strong">Reviewed before approval.</span> Every
          vendor is checked by our team — typically 2–5 working days.
        </p>
      }
      steps={[...STEPS]}
      activeStep={wizard.step}
      onBack={wizard.onBack}
      backDisabled={wizard.backDisabled}
      onContinue={wizard.onContinue}
      continueLabel={wizard.continueLabel}
      trackHref="/my-submissions"
      trackLabel="Track your applications"
    >
      {wizard.step === 0 && (
        <AccountDonePanel subtitle="Your guest account carries the vendor role. Tickets, wallet and reviews stay untouched." />
      )}

      {wizard.step === 1 && (
        <div className="flex flex-col gap-xl">
          <Field label="Business name" htmlFor="vendor-name">
            <TextInput
              id="vendor-name"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
            />
          </Field>
          <div className="grid gap-md sm:grid-cols-2">
            <Field label="Commercial registration" htmlFor="vendor-cr">
              <TextInput
                id="vendor-cr"
                placeholder="CR number"
                value={crNumber}
                onChange={(event) => setCrNumber(event.target.value)}
              />
            </Field>
            <Field label="Primary city" htmlFor="vendor-city">
              <Select
                id="vendor-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              >
                <option value="riyadh">Riyadh</option>
                <option value="jeddah">Jeddah</option>
                <option value="dammam">Dammam</option>
                <option value="khobar">Khobar</option>
              </Select>
            </Field>
          </div>
          <Field
            label={
              <>
                Website or Instagram{' '}
                <span className="font-medium text-ink-muted">— optional</span>
              </>
            }
            htmlFor="vendor-web"
          >
            <TextInput
              id="vendor-web"
              placeholder="https://"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </Field>
          <Field
            label="Tell organizers what you do"
            htmlFor="vendor-story"
            counter={`${story.length} / 400`}
          >
            <Textarea
              id="vendor-story"
              rows={4}
              value={story}
              onChange={(event) => setStory(event.target.value)}
            />
          </Field>
        </div>
      )}

      {wizard.step === 2 && (
        <div className="flex flex-col gap-xl">
          <ChipMultiSelect
            label="Services you offer"
            hint="Pick every category organizers should find you under."
            options={SERVICES}
            value={services}
            onChange={setServices}
          />
          <Field label="Coverage area" htmlFor="vendor-coverage">
            <TextInput
              id="vendor-coverage"
              value={coverage}
              onChange={(event) => setCoverage(event.target.value)}
              placeholder="e.g. Riyadh Region + Eastern Province"
            />
          </Field>
          <Checkbox
            id="vendor-travel"
            checked={travelOk}
            onCheckedChange={(value) => setTravelOk(value === true)}
            label="We're open to travelling outside our home city for the right job"
          />
        </div>
      )}

      {wizard.step === 3 && (
        <div className="flex flex-col gap-xl">
          <Field label="Years operating" htmlFor="vendor-years">
            <Select
              id="vendor-years"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            >
              <option value="1">Under 1 year</option>
              <option value="2">1–2 years</option>
              <option value="5">3–5 years</option>
              <option value="10">6–10 years</option>
              <option value="11">10+ years</option>
            </Select>
          </Field>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              Business licence or credentials
            </p>
            <FileDropButton
              label="Upload licence or certificate"
              hint="PDF or image, up to 10 MB"
            />
          </div>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              Government ID of the person responsible
            </p>
            <FileDropButton label="Upload national ID, iqama or passport" hint="PDF or image" />
          </div>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              Photos of real previous work
            </p>
            <FileDropButton
              label="Add work photos"
              hint="At least one — organizers hire on proof"
            />
          </div>
        </div>
      )}

      {wizard.step === 4 && (
        <div className="flex flex-col gap-xl">
          <ReviewSummary
            rows={[
              { label: 'Business', value: businessName || '—' },
              { label: 'City', value: city },
              { label: 'Services', value: joinOrDash(services) },
              { label: 'Coverage', value: coverage || '—' },
              { label: 'CR', value: crNumber || 'Add on step 2' },
            ]}
          />
          <p className="text-[13.5px] leading-[1.55] text-ink-secondary">
            Our team checks licences and work photos by hand. You&apos;ll hear back within 2–5
            working days — by notification and email.
          </p>
          <ReviewTerms
            checked={terms}
            onCheckedChange={setTerms}
            label="I confirm this information is accurate and I agree to the vendor marketplace terms."
          />
        </div>
      )}
    </FormWizardShell>
  )
}
