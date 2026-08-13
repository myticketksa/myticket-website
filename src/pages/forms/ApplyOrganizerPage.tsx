import { useState } from 'react'
import {
  ChipMultiSelect,
  Field,
  FileDropButton,
  Radio,
  RadioGroup,
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

const STEPS = ['Account', 'Public presence', 'The entity', 'Verification', 'Review'] as const

const REGIONS = ['Riyadh', 'Makkah', 'Madinah', 'Eastern Province', 'Asir', 'Other'] as const

/** Apply organizer — Figma `207:11424` (step labels); steps 2–5 inferred from need list. */
export function ApplyOrganizerPage() {
  const wizard = useApplyWizard(STEPS.length)
  const [publicName, setPublicName] = useState('Night Owl Productions')
  const [bio, setBio] = useState(
    'We produce late-night concerts and warehouse sets across Riyadh — seating plans, door ops and a roster that sells out.',
  )
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [entityType, setEntityType] = useState('company')
  const [legalName, setLegalName] = useState('')
  const [registration, setRegistration] = useState('')
  const [contactEmail, setContactEmail] = useState('sara@email.com')
  const [contactPhone, setContactPhone] = useState('+966 5•• ••• 812')
  const [regions, setRegions] = useState<string[]>(['Riyadh'])
  const [terms, setTerms] = useState(false)

  return (
    <FormWizardShell
      eyebrow="Organizer application"
      title="Apply to organize events."
      subtitle="Five short parts. Your progress saves as you go, so you can leave and come back."
      notice={
        <p>
          <span className="font-bold text-ink-brand-strong">Reviewed before approval.</span> Our
          team checks every organizer application — typically 2–5 working days. Knowing that now
          beats finding out at the end.
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
        <div className="flex flex-col gap-[16px]">
          <AccountDonePanel subtitle="sara@email.com · +966 5•• ••• 812 · Your tickets, wallet and reviews stay exactly as they are." />
          <p className="text-[13.5px] leading-[1.55] text-ink-secondary">
            Applying without an account? You&apos;d create one here first — name, email, phone and a
            password. Signed-in guests skip straight to the next part.
          </p>
        </div>
      )}

      {wizard.step === 1 && (
        <div className="flex flex-col gap-xl">
          <Field label="Public name" htmlFor="org-public">
            <TextInput
              id="org-public"
              value={publicName}
              onChange={(event) => setPublicName(event.target.value)}
            />
          </Field>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">Logo</p>
            <FileDropButton label="Upload logo" hint="PNG or JPG, square works best" />
          </div>
          <Field
            label="Producer biography"
            htmlFor="org-bio"
            counter={`${bio.length} / 600 · min 80`}
          >
            <Textarea
              id="org-bio"
              rows={4}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
          </Field>
          <div className="grid gap-md sm:grid-cols-2">
            <Field
              label={
                <>
                  Website <span className="font-medium text-ink-muted">— optional</span>
                </>
              }
              htmlFor="org-web"
            >
              <TextInput
                id="org-web"
                placeholder="https://"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </Field>
            <Field
              label={
                <>
                  Instagram <span className="font-medium text-ink-muted">— optional</span>
                </>
              }
              htmlFor="org-ig"
            >
              <TextInput
                id="org-ig"
                placeholder="@handle"
                value={instagram}
                onChange={(event) => setInstagram(event.target.value)}
              />
            </Field>
          </div>
        </div>
      )}

      {wizard.step === 2 && (
        <div className="flex flex-col gap-xl">
          <div>
            <p className="mb-[10px] text-[13px] font-semibold text-ink-primary">Entity type</p>
            <RadioGroup
              value={entityType}
              onValueChange={setEntityType}
              className="flex flex-col gap-[10px]"
            >
              <Radio value="company" id="entity-company" label="Registered company" />
              <Radio value="individual" id="entity-individual" label="Individual organizer" />
            </RadioGroup>
          </div>
          <Field
            label={entityType === 'company' ? 'Legal company name' : 'Full legal name'}
            htmlFor="org-legal"
          >
            <TextInput
              id="org-legal"
              value={legalName}
              onChange={(event) => setLegalName(event.target.value)}
              placeholder={
                entityType === 'company' ? 'As on commercial registration' : 'As on government ID'
              }
            />
          </Field>
          <Field
            label={
              entityType === 'company' ? 'Commercial registration number' : 'National ID / iqama'
            }
            htmlFor="org-reg"
          >
            <TextInput
              id="org-reg"
              value={registration}
              onChange={(event) => setRegistration(event.target.value)}
            />
          </Field>
          <ChipMultiSelect
            label="Operating regions"
            options={REGIONS}
            value={regions}
            onChange={setRegions}
          />
          <div className="grid gap-md sm:grid-cols-2">
            <Field label="Business contact email" htmlFor="org-email">
              <TextInput
                id="org-email"
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
              />
            </Field>
            <Field label="Business phone" htmlFor="org-phone">
              <TextInput
                id="org-phone"
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
              />
            </Field>
          </div>
        </div>
      )}

      {wizard.step === 3 && (
        <div className="flex flex-col gap-xl">
          <p className="text-[13.5px] leading-[1.55] text-ink-secondary">
            Upload clear scans. If something&apos;s missing we&apos;ll message you rather than
            decline outright.
          </p>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              Government ID
            </p>
            <FileDropButton
              label="Upload national ID, iqama or passport"
              hint="PDF or image, up to 10 MB"
            />
          </div>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              {entityType === 'company'
                ? 'Commercial registration or event licence'
                : 'Event permit or licence (if you have one)'}
            </p>
            <FileDropButton
              label="Upload registration or licence"
              hint="Optional for individuals when the event type allows"
            />
          </div>
          <Field label="Preferred payout bank country" htmlFor="org-bank">
            <Select id="org-bank" defaultValue="sa">
              <option value="sa">Saudi Arabia</option>
            </Select>
          </Field>
        </div>
      )}

      {wizard.step === 4 && (
        <div className="flex flex-col gap-xl">
          <ReviewSummary
            rows={[
              { label: 'Public name', value: publicName || '—' },
              {
                label: 'Entity',
                value: entityType === 'company' ? 'Registered company' : 'Individual',
              },
              { label: 'Regions', value: joinOrDash(regions) },
              { label: 'Contact', value: contactEmail || '—' },
              { label: 'Registration', value: registration || 'Add on step 3' },
            ]}
          />
          <p className="text-[13.5px] leading-[1.55] text-ink-secondary">
            After approval you&apos;ll build events in the business workspace — venue, tickets, seat
            plan and refund policy.
          </p>
          <ReviewTerms
            checked={terms}
            onCheckedChange={setTerms}
            label="I confirm this information is accurate and I agree to the organizer terms and payout rules."
          />
        </div>
      )}
    </FormWizardShell>
  )
}
