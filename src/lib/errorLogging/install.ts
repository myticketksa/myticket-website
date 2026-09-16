import { addBreadcrumb } from './breadcrumbs'
import { stashOriginalConsole } from './consoleSafe'
import { stackLogger } from './logger'
import { reportErrorAsync } from './reportError'
import type { ErrorLevel } from './types'

let installed = false
let forwardingConsole = false

type ConsoleMethod = 'debug' | 'info' | 'log' | 'warn' | 'error'

const CONSOLE_LEVEL_MAP: Record<ConsoleMethod, ErrorLevel> = {
  debug: 'debug',
  info: 'info',
  log: 'info',
  warn: 'warning',
  error: 'error',
}

function patchConsoleMethod(method: ConsoleMethod) {
  const original = console[method].bind(console)
  stashOriginalConsole(method, original)
  console[method] = (...args: unknown[]) => {
    original(...args)
    if (forwardingConsole) return
    forwardingConsole = true
    try {
      stackLogger.fromConsole(CONSOLE_LEVEL_MAP[method], args, `console.${method}`)
    } finally {
      forwardingConsole = false
    }
  }
}

/**
 * Capture uncaught errors, unhandled rejections, and every console level
 * (`debug` / `info` / `log`→info / `warn`→warning / `error`), then forward
 * them to StackLogger. Call once from `main.tsx` before rendering.
 *
 * `fatal` is registered for explicit `logFatal` / boundary / `window.onerror` paths.
 */
export function installGlobalErrorLogging() {
  if (installed || typeof window === 'undefined') return
  installed = true

  window.addEventListener('error', (event) => {
    const error = event.error ?? event.message
    reportErrorAsync(error, {
      handled: false,
      level: 'fatal',
      name: error instanceof Error ? error.name : 'WindowError',
      tags: { component: 'window', source: 'error' },
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    reportErrorAsync(event.reason, {
      handled: false,
      level: 'error',
      name: 'UnhandledRejection',
      tags: { component: 'window', source: 'unhandledrejection' },
    })
  })

  // Register all stack levels via console.* so any occurrence is ingested.
  ;(Object.keys(CONSOLE_LEVEL_MAP) as ConsoleMethod[]).forEach(patchConsoleMethod)

  addBreadcrumb({
    category: 'lifecycle',
    message: 'Error logging installed (debug/info/warning/error/fatal)',
    level: 'info',
  })

  stackLogger.info('StackLogger levels registered', {
    name: 'StackLogger.Ready',
    tags: { component: 'errorLogging', source: 'install' },
    extra: {
      levels: ['debug', 'info', 'warning', 'error', 'fatal'],
    },
  })
}
