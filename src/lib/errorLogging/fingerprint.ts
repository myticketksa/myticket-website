/** Stable-ish fingerprint from level + error name + message + top stack frame. */
export function buildFingerprint(
  name: string,
  message: string,
  stack: string,
  level = 'error',
): string {
  const topFrame =
    stack
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.includes('node_modules') && line !== name) ?? ''

  const raw = `${level}|${name}|${message}|${topFrame}`.toLowerCase()
  let hash = 2166136261
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return `fp_${(hash >>> 0).toString(16)}`
}
