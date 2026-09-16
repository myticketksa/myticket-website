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

/** Normalize login / stored user so `walletBalance` is always a finite number when present. */
export function normalizeAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>
  const id = Number(record.id)
  if (!Number.isFinite(id)) return null

  const walletRaw = record.walletBalance ?? record.wallet_balance ?? record.balance
  const walletNum = walletRaw == null || walletRaw === '' ? undefined : Number(walletRaw)

  return {
    id,
    name: String(record.name ?? ''),
    email: String(record.email ?? ''),
    phone: String(record.phone ?? ''),
    role: String(record.role ?? 'default'),
    emailVerified: Boolean(record.emailVerified ?? record.email_verified),
    walletBalance: walletNum != null && Number.isFinite(walletNum) ? walletNum : undefined,
    created_at:
      record.created_at != null
        ? String(record.created_at)
        : record.createdAt != null
          ? String(record.createdAt)
          : undefined,
  }
}

/** Format the saved login wallet balance for UI (AccountWalletCard, profile, wallet page). */
export function formatAuthWalletBalance(
  value: unknown,
  fallback = 'SAR 0',
): string {
  if (value == null || value === '') return fallback
  const raw = String(value)
  if (/sar/i.test(raw)) return raw
  const num = Number(value)
  if (!Number.isFinite(num)) return raw
  return `SAR ${num.toLocaleString(undefined, {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? normalizeAuthUser(JSON.parse(raw)) : null
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
      action: PayloadAction<{ token: string; user: AuthUser | Record<string, unknown>; persist?: boolean }>,
    ) {
      const { token, persist = true } = action.payload
      const user = normalizeAuthUser(action.payload.user)
      state.token = token
      state.user = user
      if (persist && user) {
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
    userUpdated(state, action: PayloadAction<AuthUser | Record<string, unknown>>) {
      const user = normalizeAuthUser(action.payload)
      if (!user) return
      state.user = user
      if (state.token) {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      }
    },
  },
})

export const { credentialsSet, credentialsCleared, userUpdated } = authSlice.actions
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

export function selectWalletBalance(state: { auth: AuthState }) {
  return state.auth.user?.walletBalance
}
