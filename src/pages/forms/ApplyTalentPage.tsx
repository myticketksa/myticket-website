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
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAuthUser } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { useRequireAuth } from '@/lib/auth/useRequireAuth'
import { mapApiIdLabelOptions, type IdLabelOption } from '@/lib/api/formPayload'
import { clearDraft, loadDraft, saveDraft } from '@/lib/forms/draftStorage'
import { apiErrorMessage } from '@/lib/api/unwrap'
import { catalogLabel } from '@/lib/i18n/catalogLabels'

const STEP_KEYS = ['account', 'performer', 'portfolio', 'categories', 'review'] as const

const FALLBACK_CATEGORY_DEFS = [
  { value: '1', key: 'singer' },
  { value: '2', key: 'band' },
  { value: '3', key: 'dj' },
  { value: '4', key: 'comedian' },
  { value: '5', key: 'speaker' },
  { value: '6', key: 'dancer' },
  { value: '7', key: 'host' },
  { value: '8', key: 'instrumentalist' },
] as const

const FALLBACK_CITIES: IdLabelOption[] = [
  { value: '1', label: 'Riyadh' },
  { value: '2', label: 'Jeddah' },
  { value: '3', label: 'Dammam' },
  { value: '4', label: 'Khobar' },
]

type TalentDraft = {
  email: string
  phone: string
  stageName: string
  cityId: string
  bio: string
  /** `performer[profilePhoto]` */
  profilePhoto?: File
  /** `portfolio[media][]` — min 1 */
  portfolioMedia: File[]
  /** `categories[performanceCategories][]` — min 1 */
  categoryIds: string[]
  terms: boolean
}

/** Apply talent — FormData keys match Postman `POST /applications/talent`. */
export function ApplyTalentPage() {
  const { t } = useTranslation(['forms', 'common'])
  const { t: tCatalog } = useTranslation('catalog')
  const { roleLabel } = useLocale()
  const talent = roleLabel('talent')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const { isAuthenticated, requireAuth } = useRequireAuth()
  const [applyTalent, applyState] = useApplyTalentMutation()
  const { data: apiCities } = useGetCitiesQuery(undefined, { skip: !isAuthenticated })
  const { data: apiCategories } = useGetPerformanceCategoriesQuery(undefined, {
    skip: !isAuthenticated,
  })
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<TalentDraft>(() => ({
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    stageName: '',
    cityId: '1',
    bio: '',
    profilePhoto: undefined,
    portfolioMedia: [],
    categoryIds: [],
    terms: false,
  }))
  const [draftSaved, setDraftSaved] = useState(false)
  const [restoredNote, setRestoredNote] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) requireAuth()
  }, [isAuthenticated]) // requireAuth is stable enough for gate-once

  const steps = useMemo(
    () => STEP_KEYS.map((key) => t(`forms:talent.steps.${key}`)),
    [t],
  )

  useEffect(() => {
    const stored = loadDraft<Record<string, unknown>>('talent')
    if (!stored) return
    setStep(Math.min(stored.step, STEP_KEYS.length - 1))
    setDraft((prev) => ({
      ...prev,
      ...(stored.draft as Partial<TalentDraft>),
      email: String(stored.draft.email ?? prev.email ?? user?.email ?? ''),
      phone: String(stored.draft.phone ?? prev.phone ?? user?.phone ?? ''),
      profilePhoto: undefined,
      portfolioMedia: [],
      categoryIds: Array.isArray(stored.draft.categoryIds)
        ? (stored.draft.categoryIds as string[])
        : [],
      terms: Boolean(stored.draft.terms),
    }))
    setRestoredNote(true)
  }, [user?.email, user?.phone])

  const categoryOptions = useMemo(() => {
    const fallback = FALLBACK_CATEGORY_DEFS.map((item) => ({
      value: item.value,
      label: t(`forms:talent.categories.${item.key}`),
    }))
    return mapApiIdLabelOptions(apiCategories, fallback)
  }, [apiCategories, t])

  const cityOptions = useMemo(
    () =>
      mapApiIdLabelOptions(apiCities, FALLBACK_CITIES).map((city) => ({
        ...city,
        label: catalogLabel(tCatalog, city.label),
      })),
    [apiCities, tCatalog],
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

  function validateStep(current: number): string | null {
    if (current === 0) {
      if (!draft.email.trim()) return t('forms:talent.validation.email')
      if (!draft.phone.trim()) return t('forms:talent.validation.phone')
      return null
    }
    if (current === 1) {
      if (!draft.stageName.trim()) return t('forms:talent.validation.stageName')
      if (!draft.cityId) return t('forms:talent.validation.city')
      if (!draft.bio.trim()) return t('forms:talent.validation.bio')
      if (!draft.profilePhoto) return t('forms:talent.validation.profilePhoto')
      return null
    }
    if (current === 2) {
      if (draft.portfolioMedia.length < 1) return t('forms:talent.validation.portfolio')
      return null
    }
    if (current === 3) {
      if (draft.categoryIds.length < 1) return t('forms:talent.validation.categories')
      return null
    }
    if (current === lastStep) {
      if (!draft.terms) return t('forms:talent.validation.terms')
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
    body.append('contacts[email]', draft.email.trim())
    body.append('contacts[phone]', draft.phone.trim())

    try {
      await applyTalent(body).unwrap()
      clearDraft('talent')
      dispatch(toastPushed('success', t('forms:talent.success')))
      navigate('/application-submitted?role=talent')
    } catch (err) {
      dispatch(toastPushed('error', apiErrorMessage(err, t('forms:talent.error'))))
    }
  }

  function handleClear() {
    clearDraft('talent')
    setDraft({
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      stageName: '',
      cityId: '1',
      bio: '',
      profilePhoto: undefined,
      portfolioMedia: [],
      categoryIds: [],
      terms: false,
    })
    setStep(0)
    setDraftSaved(false)
    setRestoredNote(false)
  }

  if (!isAuthenticated) return null

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
      {step === 0 && (
        <div className="flex flex-col gap-xl">
          <AccountDonePanel subtitle={t('forms:accountDone.subtitle')} />
          <Field label={t('forms:talent.fields.email')} htmlFor="talent-email">
            <TextInput
              id="talent-email"
              type="email"
              value={draft.email}
              onChange={(event) => patch({ email: event.target.value })}
              placeholder={t('forms:talent.fields.emailPlaceholder')}
              autoComplete="email"
            />
          </Field>
          <Field label={t('forms:talent.fields.phone')} htmlFor="talent-phone">
            <TextInput
              id="talent-phone"
              type="tel"
              value={draft.phone}
              onChange={(event) => patch({ phone: event.target.value })}
              placeholder={t('forms:talent.fields.phonePlaceholder')}
              autoComplete="tel"
            />
          </Field>
        </div>
      )}

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
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              {t('forms:talent.fields.profilePhotoTitle')}
            </p>
            <FileDropButton
              label={t('forms:talent.fields.profilePhotoUpload')}
              hint={t('forms:talent.fields.profilePhotoHint')}
              accept="image/*"
              fileName={draft.profilePhoto?.name}
              onFiles={(files) => patch({ profilePhoto: files[0] })}
            />
          </div>
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
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-xl">
          <ReviewSummary
            rows={[
              {
                label: t('forms:talent.fields.reviewEmail'),
                value: draft.email.trim() || t('forms:review.notSet'),
              },
              {
                label: t('forms:talent.fields.reviewPhone'),
                value: draft.phone.trim() || t('forms:review.notSet'),
              },
              {
                label: t('forms:talent.fields.reviewStage'),
                value: draft.stageName.trim() || t('forms:review.notSet'),
              },
              { label: t('forms:talent.fields.reviewCity'), value: cityLabel },
              {
                label: t('forms:talent.fields.reviewProfilePhoto'),
                value: draft.profilePhoto
                  ? t('forms:review.provided')
                  : t('forms:review.notSet'),
              },
              {
                label: t('forms:talent.fields.reviewPortfolio'),
                value: draft.portfolioMedia.length
                  ? t('forms:talent.fields.filesSelected', {
                      count: draft.portfolioMedia.length,
                    })
                  : t('forms:talent.fields.noneAdded'),
              },
              {
                label: t('forms:talent.fields.reviewCategories'),
                value: joinOrDash(categoryLabels),
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
