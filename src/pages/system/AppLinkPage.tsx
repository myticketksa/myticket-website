import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/site'

/**
 * One link for the emails' buttons: myticket.sa/app. An email can't tell
 * which phone opens it, so this page does — iPhone and iPad go to the App
 * Store, Android to Google Play, anything else to the website (`?next=/path`,
 * home by default).
 */
export function AppLinkPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const agent = navigator.userAgent
    // iPadOS reports itself as a Mac; touch gives it away.
    const isApple =
      /iPhone|iPad|iPod/i.test(agent) || (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1)
    if (isApple) {
      window.location.replace(APP_STORE_URL)
      return
    }
    if (/Android/i.test(agent)) {
      window.location.replace(PLAY_STORE_URL)
      return
    }
    // Only a path on this site, never another address.
    const next = params.get('next') ?? '/'
    navigate(next.startsWith('/') && !next.startsWith('//') ? next : '/', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
