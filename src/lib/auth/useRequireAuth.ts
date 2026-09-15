import { useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectIsAuthenticated } from '@/features/auth/authSlice'

/** Navigate to sign-in with return URL, or run `whenAuthed` if already signed in. */
export function useRequireAuth() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  function requireAuth(whenAuthed?: () => void) {
    if (isAuthenticated) {
      whenAuthed?.()
      return true
    }
    navigate(`/sign-in?next=${encodeURIComponent(location.pathname + location.search)}`)
    return false
  }

  return { isAuthenticated, requireAuth }
}
