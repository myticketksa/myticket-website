import type { StackLoggerBreadcrumb } from './types'

const MAX_BREADCRUMBS = 30
const buffer: StackLoggerBreadcrumb[] = []

export function addBreadcrumb(
  breadcrumb: Omit<StackLoggerBreadcrumb, 'timestamp'> & { timestamp?: string },
) {
  buffer.push({
    ...breadcrumb,
    timestamp: breadcrumb.timestamp ?? new Date().toISOString(),
  })
  if (buffer.length > MAX_BREADCRUMBS) {
    buffer.splice(0, buffer.length - MAX_BREADCRUMBS)
  }
}

export function getBreadcrumbs(): StackLoggerBreadcrumb[] {
  return buffer.map((item) => ({ ...item }))
}

export function clearBreadcrumbs() {
  buffer.length = 0
}
