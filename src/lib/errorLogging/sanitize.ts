const SECRET_KEY =
  /^(authorization|cookie|set-cookie|password|passwd|pwd|secret|token|access[_-]?token|refresh[_-]?token|api[_-]?key|apikey|x-stacklogger-key|private[_-]?key|credit[_-]?card|cvv|ssn)$/i

const SECRET_INLINE =
  /(bearer\s+[a-z0-9._\-]+)|(api[_-]?key\s*[:=]\s*['"]?[\w\-]+)|(password\s*[:=]\s*['"]?[^'"\s]+)|(access_token\s*[:=]\s*['"]?[\w.\-]+)/gi

/** Deep-clone and redact common secret fields / inline credentials. */
export function sanitizeForLogging<T>(value: T, depth = 0): T {
  if (depth > 6) return '[MaxDepth]' as T
  if (value == null) return value

  if (typeof value === 'string') {
    return value.replace(SECRET_INLINE, '[Redacted]') as T
  }

  if (typeof value !== 'object') return value

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLogging(item, depth + 1)) as T
  }

  const out: Record<string, unknown> = {}
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (SECRET_KEY.test(key)) {
      out[key] = '[Redacted]'
      continue
    }
    out[key] = sanitizeForLogging(nested, depth + 1)
  }
  return out as T
}

export function sanitizeMessage(message: string): string {
  return message.replace(SECRET_INLINE, '[Redacted]').slice(0, 4000)
}
