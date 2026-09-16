import { SITE_ORIGIN } from '@/lib/site'
import { getBreadcrumbs } from './breadcrumbs'
import { safeConsoleWarn } from './consoleSafe'
import { buildFingerprint } from './fingerprint'
import { sanitizeForLogging, sanitizeMessage } from './sanitize'
import {
  normalizeErrorLevel,
  STACK_LOGGER_LEVELS,
  type ReportErrorContext,
  type StackLoggerEvent,
  type StackLoggerUser,
} from './types'

const INGEST_URL =
  import.meta.env.VITE_STACKLOGGER_INGEST_URL ||
  'https://ingest.stacklogger.io/v0.1/errors/ingest'

const REQUEST_TIMEOUT_MS = 2500
const MAX_ATTEMPTS = 3
const RETRY_BASE_MS = 200

/** Registered StackLogger levels — all are eligible for ingest. */
export const REGISTERED_STACK_LEVELS = STACK_LOGGER_LEVELS

type UserProvider = () => StackLoggerUser | undefined | null

let userProvider: UserProvider | null = null
const recentFingerprints = new Map<string, number>()
const DEDUPE_WINDOW_MS = 8_000

/** Optional auth/user bridge — call once from app bootstrap after the store exists. */
export function setErrorLoggingUserProvider(provider: UserProvider) {
  userProvider = provider
}

function readApiKey(): string {
  return String(import.meta.env.VITE_STACKLOGGER_KEY ?? '').trim()
}

/**
 * Origin registered in StackLogger app settings.
 * Prefer `VITE_STACKLOGGER_ORIGIN`, fall back to public site origin.
 */
function configuredOrigin(): string {
  const raw = String(
    import.meta.env.VITE_STACKLOGGER_ORIGIN || import.meta.env.VITE_SITE_URL || SITE_ORIGIN,
  ).trim()
  try {
    return new URL(raw).origin
  } catch {
    return raw.replace(/\/$/, '')
  }
}

function environmentName(): string {
  return (
    String(import.meta.env.VITE_APP_ENV || '').trim() ||
    (import.meta.env.PROD ? 'production' : 'development')
  )
}

function releaseName(): string {
  return (
    String(import.meta.env.VITE_APP_RELEASE || '').trim() ||
    String(import.meta.env.VITE_APP_VERSION || '').trim() ||
    '0.0.0'
  )
}

function normalizeError(input: unknown): { name: string; message: string; stack: string } {
  if (input instanceof Error) {
    return {
      name: input.name || 'Error',
      message: sanitizeMessage(input.message || 'Unknown error'),
      stack: sanitizeMessage(input.stack || ''),
    }
  }
  if (typeof input === 'string') {
    return { name: 'Error', message: sanitizeMessage(input), stack: '' }
  }
  if (Array.isArray(input)) {
    return {
      name: 'Error',
      message: sanitizeMessage(input.map(String).join(' ')),
      stack: '',
    }
  }
  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>
    const message = sanitizeMessage(
      String(record.message ?? record.error ?? record.statusText ?? 'Unknown error'),
    )
    const name = String(record.name ?? record.code ?? 'Error')
    const stack = sanitizeMessage(String(record.stack ?? ''))
    return { name, message, stack }
  }
  return { name: 'Error', message: sanitizeMessage(String(input)), stack: '' }
}

function shouldDedupe(fingerprint: string): boolean {
  const now = Date.now()
  const last = recentFingerprints.get(fingerprint)
  recentFingerprints.set(fingerprint, now)
  for (const [key, at] of recentFingerprints) {
    if (now - at > DEDUPE_WINDOW_MS) recentFingerprints.delete(key)
  }
  return last != null && now - last < DEDUPE_WINDOW_MS
}

function buildEvent(error: unknown, context: ReportErrorContext = {}): StackLoggerEvent {
  const normalized = normalizeError(error)
  const level = normalizeErrorLevel(context.level, 'error')
  const href = typeof window !== 'undefined' ? window.location.href : ''
  const host =
    typeof window !== 'undefined'
      ? window.location.host
      : configuredOrigin().replace(/^https?:\/\//, '')
  const url = context.url || href
  const fingerprint =
    context.fingerprint ||
    buildFingerprint(normalized.name, normalized.message, normalized.stack, level)

  const user = sanitizeForLogging({
    ...(userProvider?.() ?? {}),
    ...(context.user ?? {}),
  })

  const request = sanitizeForLogging({
    method: context.request?.method ?? '',
    traceId: context.request?.traceId ?? '',
    durationMs: context.request?.durationMs ?? 0,
    ...context.request,
  })

  const tags = sanitizeForLogging({
    component: 'web',
    region: String(import.meta.env.VITE_APP_REGION || 'sa'),
    level,
    ...context.tags,
  })

  const extra = sanitizeForLogging({
    serverName: host || 'browser',
    retryCount: 0,
    durationMs: context.request?.durationMs ?? 0,
    registeredLevels: [...STACK_LOGGER_LEVELS],
    ...context.extra,
  })

  const breadcrumbs = sanitizeForLogging([
    ...getBreadcrumbs(),
    ...(context.breadcrumbs ?? []),
  ])

  const contexts = sanitizeForLogging({
    runtime: {
      browser:
        typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 180) : 'unknown',
      service: 'myticket-web',
    },
    deployment: {
      region: String(import.meta.env.VITE_APP_REGION || 'sa'),
      instance: host || 'browser',
    },
    logging: {
      levels: [...STACK_LOGGER_LEVELS],
      activeLevel: level,
    },
    ...(context.contexts ?? {}),
  })

  return {
    error: normalized.message,
    stack: normalized.stack,
    environment: environmentName(),
    framework: 'react',
    language: 'typescript',
    runtime: 'browser',
    level,
    name: context.name || normalized.name,
    fingerprint,
    handled: context.handled ?? true,
    timestamp: new Date().toISOString(),
    release: releaseName(),
    url,
    transaction:
      context.transaction ||
      (typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : ''),
    user,
    request,
    tags,
    extra,
    breadcrumbs,
    contexts,
    additionalData: context.additionalData ?? null,
    href,
    host,
    client: 'React',
  }
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function postWithRetry(payload: StackLoggerEvent): Promise<boolean> {
  const apiKey = readApiKey()
  if (!apiKey) {
    if (import.meta.env.DEV) {
      safeConsoleWarn(
        '[StackLogger] VITE_STACKLOGGER_KEY is not set — event not sent',
        payload.level,
        payload.name,
      )
    }
    return false
  }

  const origin = configuredOrigin()
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const headers = new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-StackLogger-Key': apiKey,
      })

      /**
       * Browsers treat `Origin` / `Referer` as forbidden request headers and will
       * ignore manual values — they send `Origin` automatically from the page.
       * We still set them when the runtime allows (tests / non-browser), and we
       * keep `configuredOrigin()` aligned with StackLogger app settings so the
       * automatic browser Origin matches.
       */
      try {
        headers.set('Origin', origin)
        headers.set('Referer', `${origin}/`)
      } catch {
        // Forbidden header names in browsers — safe to ignore.
      }

      const response = await fetch(INGEST_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...payload,
          extra: {
            ...payload.extra,
            retryCount: attempt - 1,
          },
        }),
        signal: controller.signal,
        credentials: 'omit',
        keepalive: true,
        mode: 'cors',
        referrer: `${origin}/`,
      })

      window.clearTimeout(timer)

      if (response.ok || response.status === 204) return true
      if (response.status === 401 || response.status === 403 || response.status === 413) {
        if (import.meta.env.DEV) {
          safeConsoleWarn('[StackLogger] ingest rejected', response.status, payload.level)
        }
        return false
      }
      lastError = new Error(`StackLogger HTTP ${response.status}`)
    } catch (error) {
      window.clearTimeout(timer)
      lastError = error
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_BASE_MS * 2 ** (attempt - 1))
    }
  }

  if (import.meta.env.DEV && lastError) {
    safeConsoleWarn('[StackLogger] ingest failed after retries', lastError)
  }
  return false
}

/**
 * Report a handled or uncaught event to StackLogger at any registered level.
 * Safe to call from UI, API clients, and global handlers.
 */
export async function reportError(
  error: unknown,
  context: ReportErrorContext = {},
): Promise<boolean> {
  if (context.skip) return false

  try {
    const event = buildEvent(error, context)
    if (shouldDedupe(event.fingerprint)) return false
    return await postWithRetry(event)
  } catch (loggingError) {
    if (import.meta.env.DEV) {
      safeConsoleWarn('[StackLogger] reportError failed', loggingError)
    }
    return false
  }
}

/** Fire-and-forget helper for call sites that should not await. */
export function reportErrorAsync(error: unknown, context?: ReportErrorContext) {
  void reportError(error, context)
}
