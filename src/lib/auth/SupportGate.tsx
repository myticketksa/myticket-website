import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useRequireAuth } from '@/lib/auth/useRequireAuth'
import { SITE_WHATSAPP_URL } from '@/lib/site'

/**
 * Contact support: signed in, the support chat; a guest goes to MyTicket's
 * WhatsApp (the footer's number) instead of being asked to sign in (29 Oct 2026).
 */
export function SupportGate() {
  const { isAuthenticated } = useRequireAuth()

  useEffect(() => {
    if (!isAuthenticated) window.location.replace(SITE_WHATSAPP_URL)
  }, [isAuthenticated])

  if (!isAuthenticated) return null
  return <Outlet />
}
