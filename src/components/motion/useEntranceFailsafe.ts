import { useEffect, useState } from 'react'

/** Grace period before content is shown regardless of the viewport observer. */
export const ENTRANCE_FAILSAFE_MS = 1200

/**
 * Entrance animations hide their content until the viewport observer fires.
 * When it does not fire the content stays invisible for good — QA found whole
 * result grids sitting at `opacity: 0` with the page looking empty.
 *
 * This is the backstop: after a short grace period the entrance is forced on,
 * so a missed trigger costs an animation rather than the content itself.
 */
export function useEntranceFailsafe(enabled = true): boolean {
  const [forced, setForced] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const timer = window.setTimeout(() => setForced(true), ENTRANCE_FAILSAFE_MS)
    return () => window.clearTimeout(timer)
  }, [enabled])

  return forced
}
