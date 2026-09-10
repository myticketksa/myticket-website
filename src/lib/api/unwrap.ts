/** Shared API envelope helpers — Postman samples use `{ success, message, data }`. */

export interface ApiEnvelope<T = unknown> {
  success?: boolean
  message?: string
  data?: T
}

export function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data as T
  }
  return payload as T
}

/** Prefer an array whether the API returns `data: []`, `data.items`, or a bare array. */
export function asList<T = Record<string, unknown>>(payload: unknown): T[] {
  const data = unwrapData<unknown>(payload)
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    for (const key of ['items', 'events', 'talents', 'experiences', 'results', 'data']) {
      if (Array.isArray(record[key])) return record[key] as T[]
    }
  }
  return []
}

export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error || typeof error !== 'object') return fallback
  const err = error as {
    data?: { message?: string; errors?: Record<string, string[]> }
    error?: string
    status?: number
  }
  if (err.data?.message) return err.data.message
  if (err.data?.errors) {
    const first = Object.values(err.data.errors)[0]
    if (first?.[0]) return first[0]
  }
  if (typeof err.error === 'string') return err.error
  return fallback
}
