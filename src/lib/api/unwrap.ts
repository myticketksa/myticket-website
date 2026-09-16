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

/** Laravel / MyTicket list pagination (`pagination` or `meta` on the envelope). */
export type ApiPagination = {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

export function extractPagination(payload: unknown): ApiPagination {
  const root =
    payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}
  const data = unwrapData<unknown>(payload)
  const nested =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {}

  const candidates = [root.pagination, root.meta, nested.pagination, nested.meta]
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue
    const p = candidate as Record<string, unknown>
    const currentPage = Number(p.current_page ?? p.currentPage ?? p.page ?? 1)
    const lastPage = Number(
      p.last_page ?? p.lastPage ?? p.totalPages ?? p.total_pages ?? 1,
    )
      const perPage = Number(p.per_page ?? p.perPage ?? 15)
    const total = Number(p.total ?? 0)
    if (!Number.isFinite(lastPage) || lastPage < 1) continue
    return {
      currentPage: Number.isFinite(currentPage) && currentPage >= 1 ? currentPage : 1,
      lastPage,
      perPage: Number.isFinite(perPage) && perPage > 0 ? perPage : 15,
      total: Number.isFinite(total) && total >= 0 ? total : 0,
    }
  }

  const items = asList(payload)
  return {
    currentPage: 1,
    lastPage: 1,
    perPage: Math.max(items.length, 1),
    total: items.length,
  }
}

/** Compact page list for `NumberedPagination` (always includes 1, current neighbourhood, last). */
export function buildPageNumbers(current: number, lastPage: number): number[] {
  const last = Math.max(1, lastPage)
  const page = Math.min(Math.max(1, current), last)
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1)
  }
  const set = new Set<number>([1, last, page, page - 1, page + 1, page - 2, page + 2])
  return [...set].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b)
}

export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error || typeof error !== 'object') return fallback
  const err = error as {
    data?: { message?: string; errors?: Record<string, string[]>; error?: string }
    error?: string
    status?: number
  }
  if (err.status === 413) return 'Uploaded files are too large. Please choose smaller files and try again.'
  if (err.data?.message) return err.data.message
  if (err.data?.errors) {
    const first = Object.values(err.data.errors)[0]
    if (first?.[0]) return first[0]
  }
  if (typeof err.error === 'string') return err.error
  return fallback
}
