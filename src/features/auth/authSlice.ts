import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const TOKEN_KEY = 'myticket.access_token'
const USER_KEY = 'myticket.user'

export interface AuthUser {
  id: number
  name: string
  email: string
  phone: string
  role: string
  emailVerified?: boolean
  walletBalance?: number
  created_at?: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

const initialState: AuthState = {
  token: typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  user: typeof localStorage !== 'undefined' ? readStoredUser() : null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    credentialsSet(
      state,
      action: PayloadAction<{ token: string; user: AuthUser; persist?: boolean }>,
    ) {
      const { token, user, persist = true } = action.payload
      state.token = token
      state.user = user
      if (persist) {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    },
    credentialsCleared(state) {
      state.token = null
      state.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
  },
})

export const { credentialsSet, credentialsCleared } = authSlice.actions
export default authSlice.reducer

export function selectAuthToken(state: { auth: AuthState }) {
  return state.auth.token
}

export function selectAuthUser(state: { auth: AuthState }) {
  return state.auth.user
}

export function selectIsAuthenticated(state: { auth: AuthState }) {
  return Boolean(state.auth.token)
}
