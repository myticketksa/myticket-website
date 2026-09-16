import { addBreadcrumb } from './breadcrumbs'
import { reportErrorAsync } from './reportError'

let installed = false

/**
 * Capture uncaught errors + unhandled promise rejections.
 * Call once from `main.tsx` before rendering.
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

  addBreadcrumb({
    category: 'lifecycle',
    message: 'Error logging installed',
    level: 'info',
  })
}
