import { Link } from 'react-router-dom'
import { PageSection } from '@/layouts'

/**
 * Temporary stand-in for an unbuilt screen. Shows the Figma node so fidelity work can
 * start from a known frame, and a link back to the probe harness.
 */
export interface PageStubProps {
  title: string
  figmaNode: string
}

export function PageStub({ title, figmaNode }: PageStubProps) {
  return (
    <PageSection padTop={64} padBottom={96}>
      <p className="text-label-overline text-ink-brand-mid">Page stub</p>
      <h1 className="text-heading-h2 mt-sm text-ink-primary">{title}</h1>
      <p className="text-body-default mt-md text-ink-secondary">
        Figma node <code className="font-semibold text-ink-primary">{figmaNode}</code>. This
        route is wired; the screen itself is not built yet.
      </p>
      <p className="mt-lg">
        <Link to="/probe" className="text-[14px] font-bold text-ink-brand-mid">
          Open component probe
        </Link>
      </p>
    </PageSection>
  )
}
