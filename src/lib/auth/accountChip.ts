import { useGetNotificationsQuery } from '@/app/api/accountApis'
import { useAppSelector } from '@/app/hooks'
import {
  selectAuthUser,
  selectIsAuthenticated,
  type AuthUser,
} from '@/features/auth/authSlice'
import { countUnreadNotifications } from '@/lib/notifications/unread'

export function accountChipFromUser(
  user: AuthUser | null | undefined,
  unread = 0,
): { name: string; initials: string; notifications: number } {
  const name = user?.name?.trim() ?? ''
  const parts = name.split(/\s+/).filter(Boolean)
  const firstName = parts[0] || 'Guest'
  const initials =
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '—'

  return {
    name: firstName,
    initials,
    notifications: unread,
  }
}

/** Same signed-in header chip on MainLayout and AccountLayout. */
export function useHeaderAccount() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectAuthUser)
  const { data: notifications } = useGetNotificationsQuery(undefined, {
    skip: !isAuthenticated,
  })
  const unread = countUnreadNotifications(notifications)
  return accountChipFromUser(user, unread)
}
