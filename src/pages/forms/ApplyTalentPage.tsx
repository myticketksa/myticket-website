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
  useApplyTalentMutation,
  useGetCitiesQuery,
  useGetPerformanceCategoriesQuery,
} from '@/app/api/accountApis'
import { useAppDispatch } from '@/app/hooks'
import { toastPushed } from '@/features/ui/uiSlice'
import { mapCategoryLabel } from '@/lib/api/mappers/categories'
import { apiErrorMessage } from '@/lib/api/unwrap'

const STEPS = ['Account', 'The performer', 'Portfolio', 'Categories & ID', 'Review'] as const

const CATEGORY_OPTIONS = [
  'Singer',
  'Band',
  'DJ',
  'Comedian',
  'Speaker',
  'Dancer',
  'Host / MC',
  'Instrumentalist',
] as const

type TalentDraft = {
  stageName: string
  city: string
  bio: string
  portfolioLink: string
  categories: string[]
  idNumber: string
  terms: boolean
}

const EMPTY_DRAFT: TalentDraft = {
  stageName: '',
  city: 'riyadh',
  bio: '',
  portfolioLink: '',
  categories: [],
  idNumber: '',
  terms: false,
}

/** Apply talent — multi-step request for admin review; guest login unchanged. */
export function ApplyTalentPage() {
  const { roleLabel } = useLocale()
  const talent = roleLabel('talent')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [applyTalent, applyState] = useApplyTalentMutation()
  const { data: apiCities } = useGetCitiesQuery()
  const { data: apiCategories } = useGetPerformanceCategoriesQuery()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<TalentDraft>(EMPTY_DRAFT)

  const categoryOptions = useMemo(() => {
    const fromApi = (apiCategories ?? []).map((row) => mapCategoryLabel(row)).filter(Boolean)
    return fromApi.length > 0 ? fromApi : [...CATEGORY_OPTIONS]
  }, [apiCategories])

  const cityOptions = useMemo(() => {
    const fromApi = (apiCities ?? []).map((row) => mapCategoryLabel(row)).filter(Boolean)
    return fromApi.length > 0 ? fromApi : ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'AlUla']
  }, [apiCities])

  const lastStep = STEPS.length - 1
  const cityLabel = draft.city
    ? draft.city.charAt(0).toUpperCase() + draft.city.slice(1).replace(/-/g, ' ')
    : '—'

  function patch(partial: Partial<TalentDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }))
  }

  async function handleContinue() {
    if (step < lastStep) {
      setStep((prev) => prev + 1)
      return
    }
    const body = new FormData()
    body.append('performer[stageName]', draft.stageName)
    body.append('performer[biography]', draft.bio)
    body.append('performer[homeCity]', draft.city)
    for (const category of draft.categories) {
      body.append('categories[performanceCategories][]', category)
    }
    try {
      await applyTalent(body).unwrap()
      dispatch(toastPushed('success', 'Talent request submitted'))
      navigate('/application-submitted?role=talent')
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
      eyebrow={`${talent} request`}
      title={`Submit a ${talent} request.`}
      subtitle="Share your portfolio basics. Our team reviews every request — typically 2–5 working days. You stay signed in as a guest; acceptance does not unlock a separate login."
      notice={
        <p>
          <span className="font-bold text-ink-brand-strong">Admin review only.</span> If accepted,
          we contact you outside the platform when a match comes up — there is no in-app booking
          flow.
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
      trackHref="/my-talent-application"
      trackLabel={`Track your ${talent} request`}
      onClear={handleClear}
    >
      {step === 0 && (
        <AccountDonePanel subtitle="Your guest account stays a guest. Tickets, wallet and reviews stay untouched — this form is a request only." />
      )}

      {step === 1 && (
        <div className="flex flex-col gap-xl">
          <Field label="Stage / performer name" htmlFor="talent-stage-name">
            <TextInput
              id="talent-stage-name"
              value={draft.stageName}
              onChange={(event) => patch({ stageName: event.target.value })}
              placeholder="How guests should see you"
            />
          </Field>
          <Field label="Home city" htmlFor="talent-city">
            <Select
              id="talent-city"
              value={draft.city}
              onChange={(event) => patch({ city: event.target.value })}
            >
              {cityOptions.map((city) => (
                <option key={city} value={city.toLowerCase().replace(/\s+/g, '-')}>
                  {city}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Short bio" htmlFor="talent-bio">
            <Textarea
              id="talent-bio"
              rows={4}
              value={draft.bio}
              onChange={(event) => patch({ bio: event.target.value })}
              placeholder="Who you are on stage, what you play or perform, and a highlight gig."
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-xl">
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              Portfolio piece
            </p>
            <p className="mb-[10px] text-[13px] text-ink-secondary">
              A live video works hardest — photo or clip of a real performance.
            </p>
            <FileDropButton
              label="Upload a portfolio piece"
              hint="Video or image · max 25 MB"
            />
          </div>
          <Field label="Portfolio link (optional)" htmlFor="talent-link">
            <TextInput
              id="talent-link"
              value={draft.portfolioLink}
              onChange={(event) => patch({ portfolioLink: event.target.value })}
              placeholder="YouTube, Instagram, SoundCloud…"
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-xl">
          <ChipMultiSelect
            label="Performance categories"
            hint="Pick the crafts you actually deliver."
            options={categoryOptions}
            value={draft.categories}
            onChange={(categories) => patch({ categories })}
          />
          <Field label="Government ID / Iqama" htmlFor="talent-id">
            <TextInput
              id="talent-id"
              value={draft.idNumber}
              onChange={(event) => patch({ idNumber: event.target.value })}
              placeholder="National ID or Iqama number"
            />
          </Field>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">Photo of your ID</p>
            <FileDropButton label="Upload ID photo" hint="PDF or image · max 10 MB" />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-xl">
          <ReviewSummary
            rows={[
              {
                label: 'Stage name',
                value: draft.stageName.trim() || 'Not set yet',
              },
              { label: 'City', value: cityLabel },
              { label: 'Categories', value: joinOrDash(draft.categories) },
              {
                label: 'Portfolio link',
                value: draft.portfolioLink.trim() || 'None added',
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
            label="I confirm this information is accurate. I understand acceptance does not create a talent login, and booking contact after review happens outside MyTicket."
          />
        </div>
      )}
    </FormWizardShell>
  )
}
