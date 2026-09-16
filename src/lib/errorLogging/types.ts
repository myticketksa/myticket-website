/** StackLogger ingest payload — matches the StackLogger error event schema. */

export type ErrorLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug'

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

/** Optional context passed to `reportError(error, context)`. */
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
