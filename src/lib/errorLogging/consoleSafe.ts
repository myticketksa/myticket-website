type ConsoleMethod = 'debug' | 'info' | 'log' | 'warn' | 'error'

const originals: Partial<Record<ConsoleMethod, (...args: unknown[]) => void>> = {}

export function stashOriginalConsole(
  method: ConsoleMethod,
  fn: (...args: unknown[]) => void,
) {
  originals[method] = fn
}

/** Write to the real console without re-entering StackLogger forwarding. */
export function safeConsoleWarn(...args: unknown[]) {
  const warn = originals.warn ?? console.warn.bind(console)
  warn(...args)
}
