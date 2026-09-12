import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImagePlaceholder } from '@/components/data-display'
import {
  ChipMultiSelect,
  Field,
  FileDropButton,
  Select,
  TextInput,
  Textarea,
} from '@/components/ui'
import { FormWizardShell } from '@/pages/_account/FormWizard'
import { useGetCitiesQuery } from '@/app/api/accountApis'
import {
  useCreateExperienceMutation,
  useGetExperienceCategoriesQuery,
} from '@/app/api/experiencesApi'
import { useAppDispatch } from '@/app/hooks'
import { toastPushed } from '@/features/ui/uiSlice'
import { mapApiIdLabelOptions } from '@/lib/api/formPayload'
import { apiErrorMessage } from '@/lib/api/unwrap'

const STEPS = ['The place', 'Hours & services', 'Contact', 'Photos & review'] as const

const SERVICE_OPTIONS = [
  'Guided tour',
  'Meals included',
  'Transport',
  'Equipment',
  'Family friendly',
  'Photography',
] as const

const DAYS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
] as const

type HourRow = {
  dayOfWeek: string
  open: string
  close: string
  isClosed: boolean
}

type ExperienceDraft = {
  name: string
  nameAr: string
  region: string
  city: string
  category: string
  type: 'activity' | 'attraction'
  about: string
  aboutAr: string
  latitude: string
  longitude: string
  hours: HourRow[]
  services: string[]
  maxGuests: string
  price: string
  email: string
  phone: string
  website: string
  instagram: string
  cover?: File
  banner?: File
  gallery: File[]
}

const EMPTY_DRAFT: ExperienceDraft = {
  name: 'Wadi Namar Waterfall Park',
  nameAr: '',
  region: 'Riyadh',
  city: '1',
  category: '3',
  type: 'activity',
  about:
    'A man-made waterfall and lake on the southern edge of Riyadh, with walking tracks, picnic lawns and food trucks in the cooler months. Best at sunset when the falls are lit.',
  aboutAr: '',
  latitude: '24.7136',
  longitude: '46.6753',
  hours: [
    { dayOfWeek: '0', open: '08:00', close: '17:00', isClosed: false },
    { dayOfWeek: '5', open: '16:00', close: '23:00', isClosed: false },
  ],
  services: ['Family friendly'],
  maxGuests: '8',
  price: '120',
  email: '',
  phone: '',
  website: '',
  instagram: '',
  cover: undefined,
  banner: undefined,
  gallery: [],
}

function buildFormData(draft: ExperienceDraft): FormData {
  const title = draft.name.trim() || 'Untitled place'
  const titleAr = draft.nameAr.trim() || title
  const about = draft.about.trim()
  const aboutAr = draft.aboutAr.trim() || about
  const body = new FormData()

  body.append('category', draft.category)
  body.append('type', draft.type)
  body.append('place[name_en]', title)
  body.append('place[name_ar]', titleAr)
  body.append('place[latitude]', draft.latitude || '24.7136')
  body.append('place[longitude]', draft.longitude || '46.6753')
  body.append('place[region]', draft.region)
  body.append('place[city]', draft.city)
  body.append('place[about_en]', about)
  body.append('place[about_ar]', aboutAr)

  draft.hours.forEach((hour, index) => {
    body.append(`hours[${index}][dayOfWeek]`, hour.dayOfWeek)
    body.append(`hours[${index}][open]`, hour.open)
    body.append(`hours[${index}][close]`, hour.close)
    body.append(`hours[${index}][isClosed]`, hour.isClosed ? '1' : '0')
  })

  draft.services.forEach((service) => body.append('services[]', service))

  if (draft.email.trim()) body.append('contacts[email]', draft.email.trim())
  if (draft.phone.trim()) body.append('contacts[phone]', draft.phone.trim())
  if (draft.website.trim()) body.append('contacts[website]', draft.website.trim())
  if (draft.instagram.trim()) body.append('contacts[instagram]', draft.instagram.trim())

  if (draft.cover) body.append('photos[cover]', draft.cover)
  if (draft.banner) body.append('photos[banner]', draft.banner)
  draft.gallery.forEach((file) => body.append('photos[gallery][]', file))

  body.append('maxGuests', draft.maxGuests || '8')
  body.append('price', draft.price || '0')
  return body
}

/** Submit experience — FormData keys match Postman `POST /experiences`. */
export function SubmitExperiencePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<ExperienceDraft>(EMPTY_DRAFT)
  const [createExperience, createState] = useCreateExperienceMutation()
  const { data: apiCities } = useGetCitiesQuery()
  const { data: apiCategories } = useGetExperienceCategoriesQuery()

  const cityOptions = useMemo(
    () =>
      mapApiIdLabelOptions(apiCities, [
        { value: '1', label: 'Riyadh' },
        { value: '2', label: 'Diriyah' },
      ]),
    [apiCities],
  )

  const categoryOptions = useMemo(
    () =>
      mapApiIdLabelOptions(apiCategories, [
        { value: '3', label: 'Outdoors' },
        { value: '1', label: 'Food & desert' },
        { value: '2', label: 'Culture' },
      ]),
    [apiCategories],
  )

  function patch(partial: Partial<ExperienceDraft>) {
    setDraft((current) => ({ ...current, ...partial }))
  }

  function updateHour(index: number, partial: Partial<HourRow>) {
    setDraft((current) => ({
      ...current,
      hours: current.hours.map((hour, i) => (i === index ? { ...hour, ...partial } : hour)),
    }))
  }

  function validateStep(current: number): string | null {
    if (current === 0) {
      if (draft.name.trim().length < 3) return 'Give the place a name'
      if (draft.about.trim().length < 80) return 'Description needs at least 80 characters'
      return null
    }
    if (current === 1) {
      if (draft.hours.length === 0) return 'Add at least one opening day'
      if (!draft.maxGuests || Number(draft.maxGuests) < 1) return 'Set a max guest count'
      return null
    }
    if (current === 2) {
      if (!draft.email.trim() && !draft.phone.trim()) {
        return 'Add an email or phone so guests can reach you'
      }
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

    if (step < STEPS.length - 1) {
      setStep((value) => value + 1)
      return
    }

    try {
      await createExperience(buildFormData(draft)).unwrap()
      dispatch(toastPushed('success', 'Experience submitted for review'))
      navigate('/my-submissions')
    } catch (err) {
      dispatch(toastPushed('error', apiErrorMessage(err, 'Could not submit experience')))
    }
  }

  return (
    <FormWizardShell
      eyebrow="Add a place to MyTicket"
      title="Know a place worth the trip?"
      subtitle="Add it to Experiences and help other people find it. Our team checks every submission before it goes live — usually within 3 working days."
      draftSaved
      steps={[...STEPS]}
      activeStep={step}
      backDisabled={step === 0}
      onBack={() => setStep((value) => Math.max(0, value - 1))}
      onContinue={() => void handleContinue()}
      continueLabel={
        createState.isLoading
          ? 'Submitting…'
          : step === STEPS.length - 1
            ? 'Submit for review'
            : 'Continue'
      }
      trackHref="/my-submissions"
      onClear={() => {
        setDraft(EMPTY_DRAFT)
        setStep(0)
      }}
    >
      {step === 0 && (
        <div className="flex flex-col gap-xl">
          <Field label="What's it called?" htmlFor="name">
            <TextInput
              id="name"
              value={draft.name}
              onChange={(event) => patch({ name: event.target.value })}
            />
          </Field>
          <Field label="Arabic name (optional)" htmlFor="name-ar">
            <TextInput
              id="name-ar"
              dir="rtl"
              value={draft.nameAr}
              onChange={(event) => patch({ nameAr: event.target.value })}
              placeholder="اسم المكان"
            />
          </Field>
          <div className="grid gap-md sm:grid-cols-2">
            <Field label="Category" htmlFor="category">
              <Select
                id="category"
                value={draft.category}
                onChange={(event) => patch({ category: event.target.value })}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Type" htmlFor="type">
              <Select
                id="type"
                value={draft.type}
                onChange={(event) =>
                  patch({ type: event.target.value as ExperienceDraft['type'] })
                }
              >
                <option value="activity">Activity</option>
                <option value="attraction">Attraction</option>
              </Select>
            </Field>
          </div>
          <div>
            <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
              Where exactly is it?{' '}
              <span className="font-medium text-ink-muted">— drop the pin</span>
            </p>
            <ImagePlaceholder
              ratio="fill"
              caption="Map — drag to position the pin"
              className="h-[190px] rounded-[14px] border border-border-default"
            />
            <div className="mt-md grid gap-md sm:grid-cols-2">
              <Select
                value={draft.region === 'Riyadh' ? 'riyadh-region' : 'makkah'}
                onChange={(event) => {
                  patch({
                    region: event.target.value === 'makkah' ? 'Makkah' : 'Riyadh',
                  })
                }}
              >
                <option value="riyadh-region">Riyadh Region</option>
                <option value="makkah">Makkah Region</option>
              </Select>
              <Select
                value={draft.city}
                onChange={(event) => patch({ city: event.target.value })}
              >
                {cityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="mt-md grid gap-md sm:grid-cols-2">
              <Field label="Latitude" htmlFor="lat">
                <TextInput
                  id="lat"
                  value={draft.latitude}
                  onChange={(event) => patch({ latitude: event.target.value })}
                />
              </Field>
              <Field label="Longitude" htmlFor="lng">
                <TextInput
                  id="lng"
                  value={draft.longitude}
                  onChange={(event) => patch({ longitude: event.target.value })}
                />
              </Field>
            </div>
          </div>
          <div>
            <Field label="Describe it for someone who's never been" htmlFor="desc">
              <Textarea
                id="desc"
                rows={4}
                value={draft.about}
                onChange={(event) => patch({ about: event.target.value.slice(0, 600) })}
              />
            </Field>
            <div className="mt-[6px] flex items-start justify-between gap-md text-[12px] font-medium text-ink-muted">
              <p>What is it, who&apos;s it for, when&apos;s it best?</p>
              <p className="shrink-0">{draft.about.length} / 600 · min 80</p>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-xl">
          <div className="flex flex-col gap-md">
            <p className="text-[13px] font-semibold text-ink-primary">Opening hours</p>
            {draft.hours.map((hour, index) => (
              <div
                key={`${hour.dayOfWeek}-${index}`}
                className="grid gap-md rounded-[14px] border border-border-default p-md sm:grid-cols-[1.2fr_1fr_1fr_auto]"
              >
                <Select
                  value={hour.dayOfWeek}
                  onChange={(event) => updateHour(index, { dayOfWeek: event.target.value })}
                  aria-label={`Day ${index + 1}`}
                >
                  {DAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </Select>
                <TextInput
                  type="time"
                  value={hour.open}
                  disabled={hour.isClosed}
                  onChange={(event) => updateHour(index, { open: event.target.value })}
                  aria-label="Opens"
                />
                <TextInput
                  type="time"
                  value={hour.close}
                  disabled={hour.isClosed}
                  onChange={(event) => updateHour(index, { close: event.target.value })}
                  aria-label="Closes"
                />
                <label className="flex items-center gap-sm text-[13px] text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={hour.isClosed}
                    onChange={(event) => updateHour(index, { isClosed: event.target.checked })}
                  />
                  Closed
                </label>
              </div>
            ))}
            <button
              type="button"
              className="self-start text-[14px] font-semibold text-ink-brand"
              onClick={() =>
                patch({
                  hours: [
                    ...draft.hours,
                    { dayOfWeek: '1', open: '09:00', close: '17:00', isClosed: false },
                  ],
                })
              }
            >
              + Add another day
            </button>
          </div>

          <ChipMultiSelect
            label="Services included"
            options={[...SERVICE_OPTIONS]}
            value={draft.services}
            onChange={(services) => patch({ services })}
          />

          <div className="grid gap-md sm:grid-cols-2">
            <Field label="Max guests" htmlFor="max-guests">
              <TextInput
                id="max-guests"
                type="number"
                min={1}
                value={draft.maxGuests}
                onChange={(event) => patch({ maxGuests: event.target.value })}
              />
            </Field>
            <Field label="Price per guest (SAR)" htmlFor="price">
              <TextInput
                id="price"
                type="number"
                min={0}
                value={draft.price}
                onChange={(event) => patch({ price: event.target.value })}
              />
            </Field>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-xl">
          <Field label="Contact email" htmlFor="email">
            <TextInput
              id="email"
              type="email"
              value={draft.email}
              onChange={(event) => patch({ email: event.target.value })}
              placeholder="host@example.com"
            />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <TextInput
              id="phone"
              type="tel"
              value={draft.phone}
              onChange={(event) => patch({ phone: event.target.value })}
              placeholder="+966 5X XXX XXXX"
            />
          </Field>
          <Field label="Website (optional)" htmlFor="website">
            <TextInput
              id="website"
              value={draft.website}
              onChange={(event) => patch({ website: event.target.value })}
              placeholder="https://"
            />
          </Field>
          <Field label="Instagram (optional)" htmlFor="instagram">
            <TextInput
              id="instagram"
              value={draft.instagram}
              onChange={(event) => patch({ instagram: event.target.value })}
              placeholder="@handle"
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-xl">
          <FileDropButton
            label="Cover photo"
            hint="Shown on catalog cards · JPG or PNG"
            accept="image/*"
            fileName={draft.cover?.name}
            onFiles={(files) => patch({ cover: files[0] })}
          />
          <FileDropButton
            label="Banner photo"
            hint="Wide hero for the detail page"
            accept="image/*"
            fileName={draft.banner?.name}
            onFiles={(files) => patch({ banner: files[0] })}
          />
          <FileDropButton
            label="Gallery photos"
            hint="Up to several extras"
            accept="image/*"
            multiple
            fileName={
              draft.gallery.length > 0
                ? `${draft.gallery.length} file${draft.gallery.length === 1 ? '' : 's'} selected`
                : undefined
            }
            onFiles={(files) => patch({ gallery: files })}
          />

          <div className="rounded-[16px] border border-border-default bg-bg-page p-xl text-[14px] text-ink-secondary">
            <p className="text-[15px] font-semibold text-ink-primary">Ready to submit</p>
            <ul className="mt-md flex flex-col gap-[6px]">
              <li>
                <span className="font-semibold text-ink-primary">{draft.name || '—'}</span>
                {' · '}
                {categoryOptions.find((option) => option.value === draft.category)?.label ??
                  draft.category}
              </li>
              <li>
                {draft.region} · city #{draft.city} · max {draft.maxGuests} · SAR {draft.price}
              </li>
              <li>
                {draft.hours.length} opening day{draft.hours.length === 1 ? '' : 's'} ·{' '}
                {draft.services.length || 'no'} service tags
              </li>
              <li>
                Photos:{' '}
                {[draft.cover && 'cover', draft.banner && 'banner', draft.gallery.length > 0 && 'gallery']
                  .filter(Boolean)
                  .join(', ') || 'none yet'}
              </li>
            </ul>
          </div>
        </div>
      )}
    </FormWizardShell>
  )
}
