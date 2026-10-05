/**
 * Shared field format checks.
 *
 * The application forms only ever tested that a field was non-empty, so QA got
 * "abc@" accepted as an email, "abcd" as a phone number and "abc" as a ten-digit
 * commercial registration. These are the format rules the API expects.
 */

/** Local part, @, domain with at least one dot and a 2+ letter suffix. */
const EMAIL = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{2,}$/

export function isValidEmail(value: string): boolean {
  const text = value.trim()
  return text.length <= 254 && EMAIL.test(text)
}

/**
 * Saudi mobile, however the user types it: 0512345678, 512345678,
 * +966 51 234 5678. Always nine digits after the country code, starting with 5.
 */
export function isValidSaudiPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('966')) return /^9665\d{8}$/.test(digits)
  if (digits.startsWith('0')) return /^05\d{8}$/.test(digits)
  return /^5\d{8}$/.test(digits)
}

/** Saudi commercial registration: ten digits. */
export function isValidCommercialRegistration(value: string): boolean {
  return /^\d{10}$/.test(value.replace(/\D/g, ''))
}

/** A date that has already happened, and is not absurdly old. */
export function isPlausiblePastDate(value: string, maxYearsAgo = 2): boolean {
  const time = Date.parse(value)
  if (!Number.isFinite(time)) return false
  const now = Date.now()
  const earliest = now - maxYearsAgo * 365.25 * 24 * 60 * 60 * 1000
  return time <= now && time >= earliest
}

/** A date in the future, within a sensible booking horizon. */
export function isPlausibleFutureDate(value: string, maxYearsAhead = 3): boolean {
  const time = Date.parse(value)
  if (!Number.isFinite(time)) return false
  const now = Date.now()
  const latest = now + maxYearsAhead * 365.25 * 24 * 60 * 60 * 1000
  return time >= now && time <= latest
}
