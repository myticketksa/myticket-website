/** StackLogger ingest payload — matches the StackLogger error event schema. */

/** All levels StackLogger accepts — every one is registered and reportable. */
export const STACK_LOGGER_LEVELS = [
  'debug',
  'info',
  'warning',
  'error',
  'fatal',
] as const

export type ErrorLevel = (typeof STACK_LOGGER_LEVELS)[number]

export function isErrorLevel(value: unknown): value is ErrorLevel {
  return (
    typeof value === 'string' &&
    (STACK_LOGGER_LEVELS as readonly string[]).includes(value)
  )
}

/** Normalize aliases (`warn` → `warning`, `critical` → `fatal`, etc.). */
export function normalizeErrorLevel(
  value: unknown,
  fallback: ErrorLevel = 'error',
): ErrorLevel {
  if (typeof value !== 'string') return fallback
  const raw = value.trim().toLowerCase()
  if (isErrorLevel(raw)) return raw
  if (raw === 'warn' || raw === 'warning') return 'warning'
  if (raw === 'critical' || raw === 'panic' || raw === 'fatal') return 'fatal'
  if (raw === 'trace' || raw === 'verbose') return 'debug'
  if (raw === 'log' || raw === 'notice') return 'info'
  return fallback
}

export type StackLoggerBreadcrumb = {
  category: string
  message: string
  level: ErrorLevel | string
  timestamp: string
}

export type StackLoggerUser = {
  id?: string
  plan?: string
  [key: string]: unknown
}

export type StackLoggerRequest = {
  method?: string
  traceId?: string
  durationMs?: number
  [key: string]: unknown
}

export type StackLoggerEvent = {
  error: string
  stack: string
  environment: string
  framework: string
  language: string
  runtime: string
  level: string
  name: string
  fingerprint: string
  handled: boolean
  timestamp: string
  release: string
  url: string
  transaction: string
  user: StackLoggerUser
  request: StackLoggerRequest
  tags: Record<string, string | number | boolean>
  extra: Record<string, unknown>
  breadcrumbs: StackLoggerBreadcrumb[]
  contexts: Record<string, Record<string, unknown>>
  additionalData: unknown
  href: string
  host: string
  client: string
}

/** Optional context passed to `reportError` / `reportLog`. */
export type ReportErrorContext = {
  handled?: boolean
  level?: ErrorLevel
  name?: string
  transaction?: string
  fingerprint?: string
  url?: string
  tags?: Record<string, string | number | boolean>
  extra?: Record<string, unknown>
  user?: StackLoggerUser
  request?: StackLoggerRequest
  breadcrumbs?: StackLoggerBreadcrumb[]
  contexts?: Record<string, Record<string, unknown>>
  additionalData?: unknown
  /** Skip network send (e.g. expected cancellations). */
  skip?: boolean
}
