import { useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '@/app/api/authApi'
import { useAppDispatch } from '@/app/hooks'
import { credentialsCleared } from '@/features/auth/authSlice'

/** Shared logout: API call (best-effort) → clear credentials → sign-in. */
export function useSignOut() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [logout, logoutState] = useLogoutMutation()

  async function signOut() {
    try {
      await logout().unwrap()
    } catch {
      /* Clear local session even if the API call fails */
    }
    dispatch(credentialsCleared())
    navigate('/sign-in')
  }

  return { signOut, isLoading: logoutState.isLoading }
}
