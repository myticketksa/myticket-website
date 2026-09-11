import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImagePlaceholder } from '@/components/data-display'
import { Field, TextInput, Textarea, Select } from '@/components/ui'
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

const STEPS = ['The place', 'Hours & services', 'Contact', 'Photos & review']

/** Submit experience — FormData keys match Postman `POST /experiences`. */
export function SubmitExperiencePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [createExperience, createState] = useCreateExperienceMutation()
  const { data: apiCities } = useGetCitiesQuery()
  const { data: apiCategories } = useGetExperienceCategoriesQuery()
  const [name, setName] = useState('Wadi Namar Waterfall Park')
  const [region, setRegion] = useState('Riyadh')
  const [city, setCity] = useState('1')
  const [category, setCategory] = useState('3')
  const [about, setAbout] = useState(
    'A man-made waterfall and lake on the southern edge of Riyadh, with walking tracks, picnic lawns and food trucks in the cooler months. Best at sunset when the falls are lit.',
  )

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

  async function handleContinue() {
    const title = name.trim() || 'Untitled place'
    const body = new FormData()
    body.append('category', category)
    body.append('type', 'activity')
    body.append('place[name_en]', title)
    body.append('place[name_ar]', title)
    body.append('place[latitude]', '24.7136')
    body.append('place[longitude]', '46.6753')
    body.append('place[region]', region)
    body.append('place[city]', city)
    body.append('place[about_en]', about.trim())
    body.append('place[about_ar]', about.trim())
    body.append('hours[0][dayOfWeek]', '0')
    body.append('hours[0][open]', '08:00')
    body.append('hours[0][close]', '17:00')
    body.append('hours[0][isClosed]', '0')
    body.append('maxGuests', '8')
    body.append('price', '0')

    try {
      await createExperience(body).unwrap()
      dispatch(toastPushed('success', 'Experience submitted for review'))
      navigate('/my-submissions')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not submit experience')))
    }
  }

  return (
    <FormWizardShell
      eyebrow="Add a place to MyTicket"
      title="Know a place worth the trip?"
      subtitle="Add it to Experiences and help other people find it. Our team checks every submission before it goes live — usually within 3 working days."
      draftSaved
      steps={STEPS}
      activeStep={0}
      backDisabled
      onContinue={() => void handleContinue()}
      continueLabel={createState.isLoading ? 'Submitting…' : 'Continue'}
      trackHref="/my-submissions"
    >
      <div className="flex flex-col gap-xl">
        <Field label="What's it called?" htmlFor="name">
          <TextInput
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="Category" htmlFor="category">
          <Select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
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
              value={region === 'Riyadh' ? 'riyadh-region' : 'makkah'}
              onChange={(e) => {
                setRegion(e.target.value === 'makkah' ? 'Makkah' : 'Riyadh')
              }}
            >
              <option value="riyadh-region">Riyadh Region</option>
              <option value="makkah">Makkah Region</option>
            </Select>
            <Select value={city} onChange={(e) => setCity(e.target.value)}>
              {cityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Field label="Describe it for someone who's never been" htmlFor="desc">
            <Textarea
              id="desc"
              rows={4}
              value={about}
              onChange={(event) => setAbout(event.target.value)}
            />
          </Field>
          <div className="mt-[6px] flex items-start justify-between gap-md text-[12px] font-medium text-ink-muted">
            <p>What is it, who&apos;s it for, when&apos;s it best?</p>
            <p className="shrink-0">{about.length} / 600 · min 80</p>
          </div>
        </div>
      </div>
    </FormWizardShell>
  )
}
