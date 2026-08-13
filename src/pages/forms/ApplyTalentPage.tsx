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

const STEPS = ['Account', 'The performer', 'Portfolio', 'Categories & ID', 'Review'] as const

const CATEGORIES = [
  'Singer',
  'Band',
  'DJ',
  'Comedian',
  'Speaker',
  'Dancer',
  'Host / MC',
  'Other',
] as const

/** Apply talent — Figma `207:11482` (step labels); steps 2–5 inferred from need list. */
export function ApplyTalentPage() {
  const wizard = useApplyWizard(STEPS.length)
  const [stageName, setStageName] = useState('Sara Al-Harbi')
  const [bio, setBio] = useState(
    'Riyadh-based vocalist — Arabic pop and neo-soul. House bands, private nights and festival side stages.',
  )
  const [city, setCity] = useState('riyadh')
  const [travel, setTravel] = useState('region')
  const [reelUrl, setReelUrl] = useState('')
  const [highlights, setHighlights] = useState('')
  const [categories, setCategories] = useState<string[]>(['Singer'])
  const [terms, setTerms] = useState(false)

  return (
    <FormWizardShell
      eyebrow="Talent application"
      title="Apply to perform."
      subtitle="Five short parts, saved as you go. Your portfolio does most of the talking — give it your best material."
      notice={
        <p>
          <span className="font-bold text-ink-brand-strong">Reviewed before approval.</span> Every
          talent profile is checked by our team — typically 2–5 working days.
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
        <AccountDonePanel subtitle="Your guest account carries the talent role. Tickets, wallet and reviews stay untouched." />
      )}

      {wizard.step === 1 && (
        <div className="flex flex-col gap-xl">
          <Field label="Stage name" htmlFor="talent-stage">
            <TextInput
              id="talent-stage"
              value={stageName}
              onChange={(event) => setStageName(event.target.value)}
            />
          </Field>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">Profile photo</p>
            <FileDropButton label="Upload a clear headshot or stage photo" hint="PNG or JPG" />
          </div>
          <Field
            label="Biography"
            htmlFor="talent-bio"
            counter={`${bio.length} / 600 · min 80`}
          >
            <Textarea
              id="talent-bio"
              rows={4}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
          </Field>
          <div className="grid gap-md sm:grid-cols-2">
            <Field label="Home city" htmlFor="talent-city">
              <Select
                id="talent-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              >
                <option value="riyadh">Riyadh</option>
                <option value="jeddah">Jeddah</option>
                <option value="dammam">Dammam</option>
                <option value="khobar">Khobar</option>
              </Select>
            </Field>
            <div>
              <p className="mb-[10px] text-[13px] font-semibold text-ink-primary">
                Travel preference
              </p>
              <RadioGroup
                value={travel}
                onValueChange={setTravel}
                className="flex flex-col gap-[8px]"
              >
                <Radio value="city" id="travel-city" label="Home city only" />
                <Radio value="region" id="travel-region" label="Within my region" />
                <Radio value="ksa" id="travel-ksa" label="Anywhere in KSA" />
              </RadioGroup>
            </div>
          </div>
        </div>
      )}

      {wizard.step === 2 && (
        <div className="flex flex-col gap-xl">
          <Field
            label={
              <>
                Best live video or reel{' '}
                <span className="font-medium text-ink-muted">— URL</span>
              </>
            }
            htmlFor="talent-reel"
          >
            <TextInput
              id="talent-reel"
              placeholder="YouTube, Instagram or Vimeo link"
              value={reelUrl}
              onChange={(event) => setReelUrl(event.target.value)}
            />
          </Field>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              Portfolio photos or clips
            </p>
            <FileDropButton
              label="Add at least one portfolio piece"
              hint="Live video works hardest — images welcome too"
            />
          </div>
          <Field
            label={
              <>
                Notable past gigs{' '}
                <span className="font-medium text-ink-muted">— optional</span>
              </>
            }
            htmlFor="talent-highlights"
          >
            <Textarea
              id="talent-highlights"
              rows={3}
              placeholder="Festival names, venues, residencies — anything organizers would recognize."
              value={highlights}
              onChange={(event) => setHighlights(event.target.value)}
            />
          </Field>
        </div>
      )}

      {wizard.step === 3 && (
        <div className="flex flex-col gap-xl">
          <ChipMultiSelect
            label="Performance categories"
            hint="Organizers filter by these — pick every fit."
            options={CATEGORIES}
            value={categories}
            onChange={setCategories}
          />
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              Government ID — for the verified badge
            </p>
            <FileDropButton
              label="Upload national ID, iqama or passport"
              hint="PDF or image, up to 10 MB"
            />
          </div>
        </div>
      )}

      {wizard.step === 4 && (
        <div className="flex flex-col gap-xl">
          <ReviewSummary
            rows={[
              { label: 'Stage name', value: stageName || '—' },
              { label: 'City', value: city },
              { label: 'Categories', value: joinOrDash(categories) },
              {
                label: 'Travel',
                value:
                  travel === 'city'
                    ? 'Home city only'
                    : travel === 'region'
                      ? 'Within my region'
                      : 'Anywhere in KSA',
              },
              { label: 'Portfolio', value: reelUrl || 'Upload on step 3' },
            ]}
          />
          <p className="text-[13.5px] leading-[1.55] text-ink-secondary">
            Once approved, your profile goes live in the talents directory — filterable by what you
            do and where you&apos;ll travel.
          </p>
          <ReviewTerms
            checked={terms}
            onCheckedChange={setTerms}
            label="I confirm this information is accurate and I agree to the talent marketplace terms."
          />
        </div>
      )}
    </FormWizardShell>
  )
}
