import { addBreadcrumb } from './breadcrumbs'
import { reportError, reportErrorAsync } from './reportError'
import {
  STACK_LOGGER_LEVELS,
  type ErrorLevel,
  type ReportErrorContext,
} from './types'

function messageFromArgs(args: unknown[]): unknown {
  if (args.length === 0) return 'Empty log'
  if (args.length === 1) return args[0]
  return args
    .map((arg) => {
      if (arg instanceof Error) return arg.message || arg.name
      if (typeof arg === 'string') return arg
      try {
        return JSON.stringify(arg)
      } catch {
        return String(arg)
      }
    })
    .join(' ')
}

/**
 * Report any StackLogger level (`debug` | `info` | `warning` | `error` | `fatal`).
 * Prefer the typed helpers below at call sites.
 */
export async function reportLog(
  level: ErrorLevel,
  message: unknown,
  context: ReportErrorContext = {},
): Promise<boolean> {
  addBreadcrumb({
    category: context.tags?.component
      ? String(context.tags.component)
      : 'log',
    message:
      typeof message === 'string'
        ? message.slice(0, 240)
        : message instanceof Error
          ? message.message
          : String(message).slice(0, 240),
    level,
  })

  return reportError(message, {
    ...context,
    level,
    handled: context.handled ?? true,
    name: context.name ?? `Log.${level}`,
    tags: {
      channel: 'log',
      ...context.tags,
    },
  })
}

export function reportLogAsync(
  level: ErrorLevel,
  message: unknown,
  context?: ReportErrorContext,
) {
  void reportLog(level, message, context)
}

export function logDebug(message: unknown, context?: ReportErrorContext) {
  return reportLog('debug', message, context)
}

export function logInfo(message: unknown, context?: ReportErrorContext) {
  return reportLog('info', message, context)
}

export function logWarning(message: unknown, context?: ReportErrorContext) {
  return reportLog('warning', message, context)
}

export function logError(message: unknown, context?: ReportErrorContext) {
  return reportLog('error', message, context)
}

export function logFatal(message: unknown, context?: ReportErrorContext) {
  return reportLog('fatal', message, {
    ...context,
    handled: context?.handled ?? false,
  })
}

/** Fire-and-forget console-style helpers (all levels → StackLogger). */
export const stackLogger = {
  levels: STACK_LOGGER_LEVELS,
  debug: (message: unknown, context?: ReportErrorContext) => {
    reportLogAsync('debug', message, context)
  },
  info: (message: unknown, context?: ReportErrorContext) => {
    reportLogAsync('info', message, context)
  },
  warning: (message: unknown, context?: ReportErrorContext) => {
    reportLogAsync('warning', message, context)
  },
  warn: (message: unknown, context?: ReportErrorContext) => {
    reportLogAsync('warning', message, context)
  },
  error: (message: unknown, context?: ReportErrorContext) => {
    reportLogAsync('error', message, context)
  },
  fatal: (message: unknown, context?: ReportErrorContext) => {
    reportLogAsync('fatal', message, {
      ...context,
      handled: context?.handled ?? false,
    })
  },
  /** Capture raw console.* argument lists at a given level. */
  fromConsole(level: ErrorLevel, args: unknown[], source = 'console') {
    const firstError = args.find((arg) => arg instanceof Error)
    reportErrorAsync(firstError ?? messageFromArgs(args), {
      handled: true,
      level,
      name: `Console.${level}`,
      tags: { component: 'console', source },
      extra: { argCount: args.length },
    })
  },
}
