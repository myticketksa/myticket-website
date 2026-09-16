import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { credentialsCleared } from '@/features/auth/authSlice'
import { readStoredLocale } from '@/i18n/config'
import { addBreadcrumb, reportErrorAsync } from '@/lib/errorLogging'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  prepareHeaders(headers, { getState }) {
    const token = (getState() as { auth: { token: string | null } }).auth?.token
    if (token) headers.set('Authorization', `Bearer ${token}`)
    headers.set('Accept', 'application/json')
    headers.set('Accept-Language', readStoredLocale())
    return headers
  },
})

function isUnauthorized(error: FetchBaseQueryError | undefined): boolean {
  if (!error) return false
  if (error.status === 401) return true
  const data = error.data
  if (data && typeof data === 'object' && 'error' in data) {
    return String((data as { error?: unknown }).error) === 'Unauthorized'
  }
  return false
}

function requestMeta(args: string | FetchArgs): { method: string; url: string } {
  if (typeof args === 'string') return { method: 'GET', url: args }
  return {
    method: String(args.method ?? 'GET').toUpperCase(),
    url: typeof args.url === 'string' ? args.url : '',
  }
}

const AUTH_REDIRECT = '/sign-in'

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const started = performance.now()
  const meta = requestMeta(args)
  const result = await rawBaseQuery(args, api, extraOptions)
  const durationMs = Math.round(performance.now() - started)

  addBreadcrumb({
    category: 'http',
    message: `${meta.method} ${meta.url}`,
    level: result.error ? 'error' : 'info',
  })

  if (result.error) {
    if (isUnauthorized(result.error)) {
      api.dispatch(credentialsCleared())
      if (typeof window !== 'undefined' && window.location.pathname !== AUTH_REDIRECT) {
        window.location.assign(AUTH_REDIRECT)
      }
    } else {
      reportErrorAsync(result.error, {
        handled: true,
        level: 'error',
        name: 'ApiError',
        transaction: `${meta.method} ${meta.url}`,
        request: {
          method: meta.method,
          durationMs,
        },
        tags: {
          component: 'api',
          endpoint: meta.url.slice(0, 120),
        },
        extra: {
          status: result.error.status,
          durationMs,
        },
      })
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'Event',
    'Talent',
    'Experience',
    'Vendor',
    'Organizer',
    'Auction',
    'Ticket',
    'Order',
    'User',
    'Notification',
    'Review',
    'SupportCase',
    'Application',
    'Wallet',
    'Favorite',
  ],
  endpoints: () => ({}),
})
