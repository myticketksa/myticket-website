import { Field, TextInput, Textarea, Select } from '@/components/ui'
import { FormWizardShell } from '@/pages/_account/FormWizard'

const STEPS = ['The place', 'Hours & services', 'Contact', 'Photos & review']

/** Submit experience — Figma `207:6961`. Under MainLayout. */
export function SubmitExperiencePage() {
  return (
    <FormWizardShell
      title="Know a place worth the trip?"
      subtitle="Add it to Experiences and help other people find it. Our team checks every submission before it goes live — usually within 3 working days."
      draftSaved
      steps={STEPS}
      activeStep={0}
      continueTo="/my-submissions"
      trackHref="/my-submissions"
    >
      <div className="flex flex-col gap-xl">
        <Field label="What's it called?" htmlFor="name">
          <TextInput id="name" defaultValue="Wadi Namar Waterfall Park" />
        </Field>
        <div>
          <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
            Where exactly is it?{' '}
            <span className="font-medium text-ink-muted">— drop the pin</span>
          </p>
          <div className="flex h-[190px] items-center justify-center rounded-[14px] border border-border-default bg-gradient-to-b from-[#efe6de] to-[#e2d6cc] text-[12px] font-semibold text-ink-muted">
            Map — drag to position the pin
          </div>
          <div className="mt-md grid gap-md sm:grid-cols-2">
            <Select defaultValue="riyadh-region">
              <option value="riyadh-region">Riyadh Region</option>
              <option value="makkah">Makkah Region</option>
            </Select>
            <Select defaultValue="riyadh">
              <option value="riyadh">Riyadh</option>
              <option value="diriyah">Diriyah</option>
            </Select>
          </div>
        </div>
        <Field
          label="Describe it for someone who's never been"
          htmlFor="desc"
          counter="182 / 600 · min 80"
        >
          <Textarea
            id="desc"
            rows={4}
            defaultValue="A man-made waterfall and lake on the southern edge of Riyadh, with walking tracks, picnic lawns and food trucks in the cooler months. Best at sunset when the falls are lit."
          />
        </Field>
      </div>
    </FormWizardShell>
  )
}
