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
import { mapApiIdLabelOptions, type IdLabelOption } from '@/lib/api/formPayload'
import { apiErrorMessage } from '@/lib/api/unwrap'

const STEPS = ['Account', 'The performer', 'Portfolio', 'Categories & ID', 'Review'] as const

const FALLBACK_CATEGORIES: IdLabelOption[] = [
  { value: '1', label: 'Singer' },
  { value: '2', label: 'Band' },
  { value: '3', label: 'DJ' },
  { value: '4', label: 'Comedian' },
  { value: '5', label: 'Speaker' },
  { value: '6', label: 'Dancer' },
  { value: '7', label: 'Host / MC' },
  { value: '8', label: 'Instrumentalist' },
]

const FALLBACK_CITIES: IdLabelOption[] = [
  { value: '1', label: 'Riyadh' },
  { value: '2', label: 'Jeddah' },
  { value: '3', label: 'Dammam' },
  { value: '4', label: 'Khobar' },
]

type TalentDraft = {
  stageName: string
  cityId: string
  bio: string
  portfolioLink: string
  /** Postman `categories[performanceCategories][]` expects numeric ids. */
  categoryIds: string[]
  idNumber: string
  /** Postman `performer[profilePhoto]` — ID photo doubles as profile when set. */
  profilePhoto?: File
  portfolioMedia: File[]
  terms: boolean
}

const EMPTY_DRAFT: TalentDraft = {
  stageName: '',
  cityId: '1',
  bio: '',
  portfolioLink: '',
  categoryIds: [],
  idNumber: '',
  profilePhoto: undefined,
  portfolioMedia: [],
  terms: false,
}

/** Apply talent — FormData keys match Postman `POST /applications/talent`. */
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

  const categoryOptions = useMemo(
    () => mapApiIdLabelOptions(apiCategories, FALLBACK_CATEGORIES),
    [apiCategories],
  )

  const cityOptions = useMemo(
    () => mapApiIdLabelOptions(apiCities, FALLBACK_CITIES),
    [apiCities],
  )

  const lastStep = STEPS.length - 1
  const cityLabel =
    cityOptions.find((city) => city.value === draft.cityId)?.label ?? draft.cityId
  const categoryLabels = draft.categoryIds.map(
    (id) => categoryOptions.find((option) => option.value === id)?.label ?? id,
  )

  function patch(partial: Partial<TalentDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }))
  }

  async function handleContinue() {
    if (step < lastStep) {
      setStep((prev) => prev + 1)
      return
    }

    const body = new FormData()
    body.append('performer[stageName]', draft.stageName.trim())
    body.append('performer[biography]', draft.bio.trim())
    body.append('performer[homeCity]', draft.cityId)
    if (draft.profilePhoto) body.append('performer[profilePhoto]', draft.profilePhoto)
    for (const file of draft.portfolioMedia) {
      body.append('portfolio[media][]', file)
    }
    for (const categoryId of draft.categoryIds) {
      body.append('categories[performanceCategories][]', categoryId)
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
              accept="image/*,video/*"
              multiple
              fileName={
                draft.portfolioMedia.length
                  ? `${draft.portfolioMedia.length} file${draft.portfolioMedia.length > 1 ? 's' : ''} selected`
                  : undefined
              }
              onFiles={(files) => patch({ portfolioMedia: files })}
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
            value={draft.categoryIds}
            onChange={(categoryIds) => patch({ categoryIds })}
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
            <FileDropButton
              label="Upload ID photo"
              hint="PDF or image · max 10 MB"
              accept="image/*,.pdf"
              fileName={draft.profilePhoto?.name}
              onFiles={(files) => patch({ profilePhoto: files[0] })}
            />
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
              { label: 'Categories', value: joinOrDash(categoryLabels) },
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
