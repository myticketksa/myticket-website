import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useRequireAuth } from '@/lib/auth/useRequireAuth'

/**
 * Route guard — redirects guests to `/sign-in?next=…` and renders nothing
 * until auth is confirmed. Use as a layout route wrapping protected pages.
 */
export function RequireAuth() {
  const { isAuthenticated, requireAuth } = useRequireAuth()

  useEffect(() => {
    if (!isAuthenticated) requireAuth()
  }, [isAuthenticated, requireAuth])

  if (!isAuthenticated) return null
  return <Outlet />
}
