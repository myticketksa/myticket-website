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
  useApplyTalentMutation,
  useGetCitiesQuery,
  useGetPerformanceCategoriesQuery,
} from '@/app/api/accountApis'
import { useAppDispatch } from '@/app/hooks'
import { toastPushed } from '@/features/ui/uiSlice'
import { mapApiIdLabelOptions, type IdLabelOption } from '@/lib/api/formPayload'
import { clearDraft, loadDraft, saveDraft } from '@/lib/forms/draftStorage'
import { apiErrorMessage } from '@/lib/api/unwrap'

const STEP_KEYS = ['account', 'performer', 'portfolio', 'categories', 'review'] as const

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
  const { t } = useTranslation(['forms', 'common'])
  const { roleLabel } = useLocale()
  const talent = roleLabel('talent')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [applyTalent, applyState] = useApplyTalentMutation()
  const { data: apiCities } = useGetCitiesQuery()
  const { data: apiCategories } = useGetPerformanceCategoriesQuery()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<TalentDraft>(EMPTY_DRAFT)
  const [draftSaved, setDraftSaved] = useState(false)
  const [restoredNote, setRestoredNote] = useState(false)

  const steps = useMemo(
    () => STEP_KEYS.map((key) => t(`forms:talent.steps.${key}`)),
    [t],
  )

  useEffect(() => {
    const stored = loadDraft<Record<string, unknown>>('talent')
    if (!stored) return
    setStep(Math.min(stored.step, STEP_KEYS.length - 1))
    setDraft({
      ...EMPTY_DRAFT,
      ...(stored.draft as Partial<TalentDraft>),
      profilePhoto: undefined,
      portfolioMedia: [],
      categoryIds: Array.isArray(stored.draft.categoryIds)
        ? (stored.draft.categoryIds as string[])
        : [],
      terms: Boolean(stored.draft.terms),
    })
    setRestoredNote(true)
  }, [])

  const categoryOptions = useMemo(
    () => mapApiIdLabelOptions(apiCategories, FALLBACK_CATEGORIES),
    [apiCategories],
  )

  const cityOptions = useMemo(
    () => mapApiIdLabelOptions(apiCities, FALLBACK_CITIES),
    [apiCities],
  )

  const lastStep = STEP_KEYS.length - 1
  const cityLabel =
    cityOptions.find((city) => city.value === draft.cityId)?.label ?? draft.cityId
  const categoryLabels = draft.categoryIds.map(
    (id) => categoryOptions.find((option) => option.value === id)?.label ?? id,
  )

  function patch(partial: Partial<TalentDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }))
  }

  function handleSaveExit() {
    saveDraft('talent', step, draft as unknown as Record<string, unknown>)
    setDraftSaved(true)
    dispatch(toastPushed('success', t('common:draft.savedToast')))
    navigate('/')
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
      clearDraft('talent')
      dispatch(toastPushed('success', t('forms:talent.success')))
      navigate('/application-submitted?role=talent')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('forms:talent.error'))))
    }
  }

  function handleClear() {
    clearDraft('talent')
    setDraft(EMPTY_DRAFT)
    setStep(0)
    setDraftSaved(false)
    setRestoredNote(false)
  }

  return (
    <FormWizardShell
      eyebrow={t('forms:talent.eyebrow', { role: talent })}
      title={t('forms:talent.title', { role: talent })}
      subtitle={t('forms:talent.subtitle')}
      draftSaved={draftSaved}
      notice={
        <p>
          {t('forms:talent.notice')}
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
            : t('forms:talent.submit')
          : t('common:actions.continue')
      }
      trackHref="/my-talent-application"
      trackLabel={t('forms:talent.track', { role: talent })}
      onClear={handleClear}
      onSaveExit={handleSaveExit}
    >
      {step === 0 && <AccountDonePanel subtitle={t('forms:accountDone.subtitle')} />}

      {step === 1 && (
        <div className="flex flex-col gap-xl">
          <Field label={t('forms:talent.fields.stageName')} htmlFor="talent-stage-name">
            <TextInput
              id="talent-stage-name"
              value={draft.stageName}
              onChange={(event) => patch({ stageName: event.target.value })}
              placeholder={t('forms:talent.fields.stagePlaceholder')}
            />
          </Field>
          <Field label={t('forms:talent.fields.city')} htmlFor="talent-city">
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
          <Field label={t('forms:talent.fields.bio')} htmlFor="talent-bio">
            <Textarea
              id="talent-bio"
              rows={4}
              value={draft.bio}
              onChange={(event) => patch({ bio: event.target.value })}
              placeholder={t('forms:talent.fields.bioPlaceholder')}
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-xl">
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              {t('forms:talent.fields.portfolioTitle')}
            </p>
            <p className="mb-[10px] text-[13px] text-ink-secondary">
              {t('forms:talent.fields.portfolioHint')}
            </p>
            <FileDropButton
              label={t('forms:talent.fields.portfolioUpload')}
              hint={t('forms:talent.fields.portfolioFileHint')}
              accept="image/*,video/*"
              multiple
              fileName={
                draft.portfolioMedia.length
                  ? t('forms:talent.fields.filesSelected', {
                      count: draft.portfolioMedia.length,
                    })
                  : undefined
              }
              onFiles={(files) => patch({ portfolioMedia: files })}
            />
          </div>
          <Field label={t('forms:talent.fields.portfolioLink')} htmlFor="talent-link">
            <TextInput
              id="talent-link"
              value={draft.portfolioLink}
              onChange={(event) => patch({ portfolioLink: event.target.value })}
              placeholder={t('forms:talent.fields.portfolioLinkPlaceholder')}
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-xl">
          <ChipMultiSelect
            label={t('forms:talent.fields.categories')}
            hint={t('forms:talent.fields.categoriesHint')}
            options={categoryOptions}
            value={draft.categoryIds}
            onChange={(categoryIds) => patch({ categoryIds })}
          />
          <Field label={t('forms:talent.fields.idNumber')} htmlFor="talent-id">
            <TextInput
              id="talent-id"
              value={draft.idNumber}
              onChange={(event) => patch({ idNumber: event.target.value })}
              placeholder={t('forms:talent.fields.idPlaceholder')}
            />
          </Field>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              {t('forms:talent.fields.idPhotoTitle')}
            </p>
            <FileDropButton
              label={t('forms:talent.fields.idUpload')}
              hint={t('forms:talent.fields.idPhotoHint')}
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
                label: t('forms:talent.fields.reviewStage'),
                value: draft.stageName.trim() || t('forms:review.notSet'),
              },
              { label: t('forms:talent.fields.reviewCity'), value: cityLabel },
              {
                label: t('forms:talent.fields.reviewCategories'),
                value: joinOrDash(categoryLabels),
              },
              {
                label: t('forms:talent.fields.reviewPortfolio'),
                value: draft.portfolioLink.trim() || t('forms:talent.fields.noneAdded'),
              },
              {
                label: t('forms:talent.fields.reviewId'),
                value: draft.idNumber.trim() ? t('forms:review.provided') : t('forms:review.notSet'),
              },
            ]}
          />
          <ReviewTerms
            checked={draft.terms}
            onCheckedChange={(terms) => patch({ terms })}
            label={t('forms:talent.fields.confirm')}
          />
        </div>
      )}
    </FormWizardShell>
  )
}
