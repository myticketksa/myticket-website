import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Guest route change — remount page body and jump scroll to top.
 * Intentionally no opacity-0 entrance: stacking that with FadeUp/StaggerGroup
 * painted blank main content on cold navigations until scroll (QA #5/#7).
 */
export function PageFade({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return <div key={pathname}>{children}</div>
}
